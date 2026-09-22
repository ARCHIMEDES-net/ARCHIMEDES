import crypto from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { processBroadcastMailQueue } from '../../../lib/server/broadcastMailQueue';

export const config = { maxDuration: 60 };
export default async function handler(req,res) {
  res.setHeader('Cache-Control','no-store');
  if (req.method !== 'GET') { res.setHeader('Allow','GET'); return res.status(405).json({ error:'Method not allowed' }); }
  const expected=String(process.env.CRON_SECRET || '');
  const provided=String(req.headers?.authorization || '');
  if (!expected || !crypto.timingSafeEqual(crypto.createHash('sha256').update(provided).digest(),crypto.createHash('sha256').update(`Bearer ${expected}`).digest())) {
    return res.status(401).json({ error:'Unauthorized' });
  }
  const db=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY,{ auth:{ persistSession:false } });
  try {
    const { error: heartbeatError } = await db.from('broadcast_mail_worker_state').upsert({ singleton:true,last_run_at:new Date().toISOString(),error_code:null });
    if (heartbeatError) throw new Error('heartbeat_failed');
    const result=await processBroadcastMailQueue(db);
    const { error }=await db.from('broadcast_mail_worker_state').update({ last_success_at:new Date().toISOString(),error_code:null }).eq('singleton',true);
    if (error) throw new Error('heartbeat_failed');
    return res.status(200).json({ ok:true,...result });
  } catch (_error) {
    await db.from('broadcast_mail_worker_state').upsert({ singleton:true,last_run_at:new Date().toISOString(),error_code:'worker_failed' });
    return res.status(500).json({ error:'Broadcast mail processing failed' });
  }
}
