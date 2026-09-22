import { afterEach, beforeEach, expect,it,vi } from 'vitest';
import { broadcastMailMessage,deliverBroadcastMailBatch,processBroadcastMailQueue } from '../../lib/server/broadcastMailQueue';
const batch={id:'batch',lease_token:'lease',payload:[{to:['a@example.com'],text:'fixed'}]};
const rpc=vi.fn(async()=>({data:true})); const db={rpc};
beforeEach(()=>{vi.clearAllMocks();vi.stubEnv('RESEND_API_KEY','test');vi.stubEnv('REGISTRATION_EMAIL_FROM','test@example.com');rpc.mockResolvedValue({data:true});});
afterEach(()=>{vi.unstubAllEnvs();});
it.each([[200,{data:[{id:'receipt'}]},'accepted'],[429,{},'rate_limited'],[400,{},'rejected'],[503,{},'uncertain'],[200,{data:[]},'uncertain'],[409,{},'uncertain']])('persists provider outcome %i safely',async(status,body,outcome)=>{
 const fetch=vi.fn(async()=>({ok:status===200,status,json:async()=>body}));
 const result=await deliverBroadcastMailBatch(db,batch,fetch);
 expect(result.outcome).toBe(outcome);
 expect(rpc.mock.calls[0][1]).toMatchObject({p_batch_id:'batch',p_lease:'lease',p_outcome:outcome});
 expect(fetch.mock.calls[0][1].headers['Idempotency-Key']).toBe('broadcast-mail:batch');
});
it('retains unknown outcome after network failure',async()=>{
 await deliverBroadcastMailBatch(db,batch,async()=>{throw new Error('timeout');});
 expect(rpc.mock.calls[0][1].p_outcome).toBe('uncertain');
});
it('does not falsely claim success if database acknowledgement fails',async()=>{
 rpc.mockResolvedValue({error:{code:'db_failure'}});
 await expect(deliverBroadcastMailBatch(db,batch,async()=>({ok:true,json:async()=>({data:[{id:'receipt'}]})}))).rejects.toThrow('finish_broadcast_mail_batch');
});
it('links reminder to the authenticated event using the current event date',()=>{
 const m=broadcastMailMessage({id:'event',title:'Changed title',starts_at:'2026-09-25T08:00:00Z'},'reminder_30');
 expect(m.subject).toContain('Changed title');expect(m.text).toContain('10:00');expect(m.text).toContain('/portal/udalost/event');
});
it('a worker with no due jobs never contacts the email provider',async()=>{
 const fetch=vi.fn(); const idleDb={rpc:vi.fn(async()=>({data:0})),from:()=>({select:()=>({eq:()=>({lte:()=>({order:()=>({order:()=>({limit:async()=>({data:[]})})})})})})})};
 expect(await processBroadcastMailQueue(idleDb,{fetchImpl:fetch})).toEqual({attempted:0,accepted:0});
 expect(fetch).not.toHaveBeenCalled();
});
