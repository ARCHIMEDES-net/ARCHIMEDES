import {afterEach,expect,it,vi} from 'vitest';
import {invoke} from '../helpers/http';
const mocks=vi.hoisted(()=>({worker:vi.fn(),upsert:vi.fn(),update:vi.fn()}));
vi.mock('../../lib/server/broadcastMailQueue',()=>({processBroadcastMailQueue:mocks.worker}));
vi.mock('@supabase/supabase-js',()=>({createClient:()=>({from:()=>({upsert:mocks.upsert,update:()=>({eq:mocks.update})})})}));
import handler from '../../pages/api/cron/broadcast-mail';
afterEach(()=>{vi.unstubAllEnvs();vi.clearAllMocks();});
it.each([undefined,'wrong','Bearer wrong'])('rejects unauthorized cron request %s',async(authorization)=>{
 vi.stubEnv('CRON_SECRET','test-secret');
 const {res}=await invoke(handler,{method:'GET',headers:{authorization}});
 expect(res.statusCode).toBe(401);expect(mocks.worker).not.toHaveBeenCalled();
});
it('records a successful background worker heartbeat',async()=>{
 vi.stubEnv('CRON_SECRET','test-secret');mocks.upsert.mockResolvedValue({});mocks.update.mockResolvedValue({});mocks.worker.mockResolvedValue({attempted:0,accepted:0});
 const {res}=await invoke(handler,{method:'GET',headers:{authorization:'Bearer test-secret'}});
 expect(res.statusCode).toBe(200);expect(mocks.worker).toHaveBeenCalledOnce();expect(mocks.update).toHaveBeenCalledOnce();
});
it('reports a failed worker without exposing provider details',async()=>{
 vi.stubEnv('CRON_SECRET','test-secret');mocks.upsert.mockResolvedValue({});mocks.worker.mockRejectedValue(new Error('sensitive'));
 const {res}=await invoke(handler,{method:'GET',headers:{authorization:'Bearer test-secret'}});
 expect(res.statusCode).toBe(500);expect(JSON.stringify(res.body)).not.toContain('sensitive');expect(mocks.update).not.toHaveBeenCalled();
});
