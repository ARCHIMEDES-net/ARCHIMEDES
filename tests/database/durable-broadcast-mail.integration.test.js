import fs from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { it,expect } from 'vitest';
const event='00000000-0000-4000-8000-000000000001',user='00000000-0000-4000-8000-000000000002';

it('queues durably, claims exclusively, resumes safely and isolates stale or opted-out uncertain batches',async()=>{
 const db=new PGlite();
 try {
  await db.exec(`create role anon; create role authenticated; create role service_role bypassrls; create schema auth;
   create function auth.uid() returns uuid language sql as $$ select '${user}'::uuid $$;
   create table auth.users(id uuid primary key); insert into auth.users values('${user}');
   create table public.events(id uuid primary key,title text,starts_at timestamptz,is_published boolean);
   insert into events values('${event}','Original',now()+interval '2 days',true);
   create table public.broadcast_sessions(event_id uuid,is_published boolean,status text,notifications_enabled boolean,reminder_minutes int[]);
   insert into broadcast_sessions values('${event}',true,'scheduled',true,array[1440,30]);
   create table public.profiles(id uuid primary key,email text,is_active boolean,email_notifications_enabled boolean);
   insert into profiles values('${user}','a@example.com',true,true);
   create table public.notification_channel_preferences(profile_id uuid,email_enabled boolean,day_before_enabled boolean,thirty_minutes_before_enabled boolean);
   create table public.event_reminder_subscriptions(event_id uuid,profile_id uuid,enabled boolean,unique(event_id,profile_id));
   create table public.event_attendees(event_id uuid,user_id uuid,organization_id uuid,excluded_admin_context boolean default false);
   create unique index personal_attendance on event_attendees(event_id,user_id) where not excluded_admin_context;`);
  await db.exec(fs.readFileSync('supabase/migrations/20260922182021_separate_broadcast_email_invitations.sql','utf8'));
  await db.exec(fs.readFileSync('supabase/migrations/20260922185246_durable_broadcast_mail_queue.sql','utf8'));
  const call=async(name,args)=> (await db.query(`select ${name}(${args.map((_,i)=>'$'+(i+1)).join(',')}) as result`,args)).rows[0].result;
  const enqueue=(emails)=>call('enqueue_broadcast_mail',[event,emails,user]);
  const claim=async(job,emails)=>{
   const e=(await db.query('select * from events where id=$1',[event])).rows[0];
   return call('claim_broadcast_mail_batch',[job,emails,JSON.stringify({subject:e.title}),e.title,e.starts_at]);
  };
  const finish=(b,outcome,ids=[])=>call('finish_broadcast_mail_batch',[b.id,b.lease_token,outcome,JSON.stringify(ids),null]);
  const job=await enqueue(['a@example.com','b@example.com']);
  expect((await call('broadcast_mail_job_status',[event])).pending).toBe(2);
  let batch=await claim(job,['a@example.com','b@example.com']);
  expect(batch.payload).toHaveLength(2);
  expect(await claim(job,['a@example.com','b@example.com'])).toEqual({idle:true});
  expect(await call('finish_broadcast_mail_batch',[batch.id,user,'accepted','[]',null])).toBe(false);
  await finish(batch,'uncertain');
  await db.exec(`update broadcast_mail_batches set next_attempt_at=now()-interval '1 minute'`);
  const same=await claim(job,['a@example.com','b@example.com']);
  expect(same.id).toBe(batch.id); expect(same.payload).toEqual(batch.payload);
  await finish(same,'uncertain');
  await db.exec("update profiles set email_notifications_enabled=false");
  await enqueue(['a@example.com','b@example.com','c@example.com']);
  batch=await claim(job,['a@example.com','b@example.com','c@example.com']);
  expect(batch.payload.map(m=>m.to[0])).toEqual(['c@example.com']);
  expect((await call('broadcast_mail_job_status',[event])).review).toBe(2);
  await finish(batch,'rate_limited');
  await db.exec("update events set title='Changed'");
  batch=await claim(job,['c@example.com']);
  expect(batch.payload[0].subject).toBe('Changed');
  await finish(batch,'accepted',['message-c']);
  await enqueue(['c@example.com']);
  expect((await call('broadcast_mail_job_status',[event])).accepted).toBe(1);
  expect(await claim(job,['c@example.com'])).toEqual({idle:true});
  // Queued recipients removed from the current list are skipped before any send.
  await enqueue(['d@example.com']);
  expect(await claim(job,[])).toEqual({idle:true});
  expect((await call('broadcast_mail_job_status',[event])).skipped).toBe(1);
  // Attendance and an explicit reminder choice are atomic and idempotent.
  await call('attend_event_with_reminder',[event,null,true]);
  await call('attend_event_with_reminder',[event,null,false]);
  expect((await db.query('select count(*)::int as n from event_attendees')).rows[0].n).toBe(1);
  expect((await db.query('select enabled from event_reminder_subscriptions')).rows[0].enabled).toBe(false);
  // Reminder jobs are sourced only from opted-in subscriptions and preferences.
  await db.exec("update profiles set email_notifications_enabled=true; update event_reminder_subscriptions set enabled=true; update events set starts_at=now()+interval '29 minutes'");
  expect(await call('queue_due_broadcast_reminders',[])).toBe(1);
  expect(await call('queue_due_broadcast_reminders',[])).toBe(0);
  const reminder=(await db.query("select id from broadcast_mail_jobs where kind='reminder_30'")).rows[0].id;
  await db.exec('update event_reminder_subscriptions set enabled=false');
  expect(await claim(reminder,['a@example.com'])).toEqual({idle:true});
  // A changed date cannot replay an uncertain old invitation, nor block new mail.
  await enqueue(['e@example.com']); const uncertain=await claim(job,['e@example.com']); await finish(uncertain,'uncertain');
  await db.exec("update events set starts_at=starts_at+interval '1 day'");
  await enqueue(['e@example.com','f@example.com']); const fresh=await claim(job,['e@example.com','f@example.com']);
  expect(fresh.payload.map(m=>m.to[0])).toEqual(['f@example.com']);
  await finish(fresh,'uncertain');
  await db.exec("update broadcast_mail_batches set first_attempt_at=now()-interval '24 hours' where state='retry'");
  expect(await claim(job,['f@example.com'])).toEqual({idle:true});
  // More than the WebMeeting capacity is processed in bounded provider batches.
  const thousand=Array.from({length:1000},(_,i)=>`bulk${i}@example.com`);
  await enqueue(thousand);
  for(let i=0;i<10;i++) {
   const bulk=await claim(job,thousand); expect(bulk.payload).toHaveLength(100);
   await finish(bulk,'accepted',bulk.payload.map((_,n)=>`bulk-${i}-${n}`));
  }
  expect((await call('broadcast_mail_job_status',[event])).accepted).toBe(1001);
  await enqueue(['cancelled@example.com']);
  await db.exec("update broadcast_sessions set status='cancelled'");
  expect(await claim(job,['cancelled@example.com'])).toEqual({idle:true});
  expect((await call('broadcast_mail_job_status',[event])).state).toBe('cancelled');
  // If reminder persistence fails, attendance must roll back in the same RPC.
  await db.exec("delete from event_attendees; alter table event_reminder_subscriptions add constraint reject_test_reminder check(not enabled)");
  await expect(call('attend_event_with_reminder',[event,null,true])).rejects.toThrow();
  expect((await db.query('select count(*)::int as n from event_attendees')).rows[0].n).toBe(0);
  const access=(await db.query(`select has_table_privilege('authenticated','broadcast_mail_items','SELECT') as read,
   has_function_privilege('authenticated','enqueue_broadcast_mail(uuid,text[],uuid)','EXECUTE') as enqueue,
   has_function_privilege('authenticated','attend_event_with_reminder(uuid,uuid,boolean)','EXECUTE') as attend`)).rows[0];
  expect(access).toEqual({read:false,enqueue:false,attend:true});
 } finally {await db.close();}
},20000);
