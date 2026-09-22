import { invitationMessage } from './broadcastInvitationEmail';
import { validateRegistrationEmailConfiguration } from './registrationEmailProvider';
import { resolveWebMeetingParticipants } from './broadcastRecipientResolver';

async function rpc(db, name, args = {}) {
  const { data, error } = await db.rpc(name, args);
  if (error) throw new Error(`Broadcast mail: ${name} failed (${error.code || 'database'}).`);
  return data;
}

export function broadcastMailMessage(event, kind) {
  const message = invitationMessage(event);
  if (kind !== 'invitation') {
    const timing = kind === 'reminder_1440' ? 'Zítra vysíláme' : 'Vysílání začíná brzy';
    message.subject = `${timing}: ${String(event.title).replace(/[\r\n]+/g, ' ')}`;
    message.text = `${timing}. Toto připomenutí dostáváte, protože jste si je zapnuli u události.\n\n${message.text}\n\nPřipomenutí můžete vypnout na stránce události; e-mailová upozornění v nastavení svého profilu.`;
  }
  return message;
}

export async function deliverBroadcastMailBatch(db, batch, fetchImpl = fetch) {
  // A persisted batch contains the exact request for safe provider replay.
  let outcome = 'uncertain'; let ids = []; let errorCode = 'provider_unavailable';
  try {
    const response = await fetchImpl('https://api.resend.com/emails/batch', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY.trim()}`, 'Content-Type': 'application/json', 'Idempotency-Key': `broadcast-mail:${batch.id}` },
      body: JSON.stringify(batch.payload), signal: AbortSignal.timeout(15_000),
    });
    const result = await response.json().catch(() => ({}));
    if (response.ok && Array.isArray(result.data) && result.data.length === batch.payload.length && result.data.every((item) => typeof item.id === 'string' && item.id)) {
      outcome = 'accepted'; ids = result.data.map((item) => item.id); errorCode = null;
    } else if (response.status === 429) { outcome = 'rate_limited'; errorCode = 'provider_rate_limit'; }
    else if ([400,401,403,404,405,422,451].includes(response.status)) { outcome = 'rejected'; errorCode = `provider_rejected_${response.status}`; }
    else errorCode = `provider_uncertain_${response.status}`;
  } catch (_error) { /* A timeout may occur after acceptance: retain the payload and key. */ }
  const saved = await rpc(db, 'finish_broadcast_mail_batch', {
    p_batch_id: batch.id, p_lease: batch.lease_token, p_outcome: outcome, p_ids: ids, p_error: errorCode,
  });
  if (!saved) return { outcome: 'review', count: 0 };
  return { outcome, count: outcome === 'accepted' ? ids.length : 0 };
}

export async function processBroadcastMailQueue(db, { now = () => Date.now(), fetchImpl = fetch, maxBatches = 5 } = {}) {
  validateRegistrationEmailConfiguration();
  const started = now(); let attempted = 0; let accepted = 0; let jobFailures = 0;
  await rpc(db, 'queue_due_broadcast_reminders');
  for (let round = 0; round < maxBatches && now() - started < 35_000; round += 1) {
    const { data: jobs, error } = await db.from('broadcast_mail_jobs').select('id,event_id,kind')
      .eq('state','active').lte('next_run_at',new Date(now()).toISOString())
      .order('priority',{ ascending:false }).order('next_run_at').limit(10);
    if (error) throw new Error('Broadcast mail: job lookup failed.');
    let progressed = false;
    for (const job of jobs || []) {
      if (attempted >= maxBatches || now() - started >= 35_000) break;
      try {
      const [eventResult, sessionResult] = await Promise.all([
        db.from('events').select('id,title,starts_at,is_published').eq('id',job.event_id).maybeSingle(),
        db.from('broadcast_sessions').select('recipient_group_codes,manual_recipient_emails').eq('event_id',job.event_id).maybeSingle(),
      ]);
      if (eventResult.error || sessionResult.error) throw new Error('Broadcast mail: event lookup failed.');
      const event = eventResult.data;
      if (!event) continue;
      let emails = [];
      if (job.kind === 'invitation') {
        emails = (await resolveWebMeetingParticipants(db, { groupCodes: sessionResult.data?.recipient_group_codes, manualEmails: sessionResult.data?.manual_recipient_emails })).map((p) => p.email);
      } else {
        // Membership in the reminder subscription and channel preferences is
        // checked again transactionally by the claim RPC, including retries.
        for (let offset = 0; ; offset += 1000) {
          const { data, error: itemError } = await db.from('broadcast_mail_items').select('email').eq('job_id',job.id).range(offset,offset+999);
          if (itemError) throw new Error('Broadcast mail: recipient lookup failed.');
          emails.push(...(data || []).map((item) => item.email));
          if ((data || []).length < 1000) break;
        }
      }
      const batch = await rpc(db,'claim_broadcast_mail_batch',{
        p_job_id:job.id,p_valid_emails:emails,p_message:event.starts_at ? broadcastMailMessage(event,job.kind) : {},p_title:event.title,p_starts:event.starts_at,
      });
      if (!batch?.id) continue;
      const result = await deliverBroadcastMailBatch(db,batch,fetchImpl);
      attempted += 1; accepted += result.count; progressed = true;
      if (result.outcome === 'rate_limited') return { attempted, accepted };
      await new Promise((resolve) => setTimeout(resolve,600));
      } catch (_error) {
        // One malformed selection or transient failure must not starve other jobs.
        jobFailures += 1;
        const { error: deferError } = await db.from('broadcast_mail_jobs')
          .update({ next_run_at:new Date(now()+5*60_000).toISOString() }).eq('id',job.id);
        if (deferError) throw new Error('Broadcast mail: job deferral failed.');
      }
    }
    if (!progressed) break;
  }
  if (jobFailures) throw new Error('Broadcast mail: some jobs were deferred.');
  return { attempted, accepted };
}
