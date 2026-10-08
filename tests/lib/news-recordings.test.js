import { describe, expect, it } from "vitest";
import { mergeNews, parsePostNewsFields } from "../../lib/portalPostNews";
import { recordingAvailability } from "../../lib/recordingAvailability";
const now = new Date("2026-10-08T12:00:00Z");
describe("community news", () => {
  const post = { id: "p", title: "Soutěž", content: "Text", section: "contests", is_published: true, show_in_news: true, created_at: now.toISOString(), related_event_id: "e" };
  it("excludes drafts, expired and unselected posts", () => {
    expect(mergeNews([], [ {...post,is_published:false}, {...post,show_in_news:false}, {...post,news_expires_at:now.toISOString()} ], null, now)).toEqual([]);
  });
  it("deduplicates new-event cards but preserves reminders and links to the expanded post", () => {
    const feed = mergeNews([{id:"n",event_id:"e",kind:"new_event",available_at:now.toISOString()}, {id:"r",event_id:"e",kind:"event_reminder",available_at:now.toISOString()}], [post], null, now);
    expect(feed).toHaveLength(2);
    expect(feed.some(n=>n.kind === "event_reminder")).toBe(true);
    expect(feed.find(n=>n.isPost).target_path).toBe("/portal/souteze?post=p#post-p");
  });
  it("rejects invalid expiry and relationship ids; preserves omitted settings", () => {
    expect(()=>parsePostNewsFields({news_expires_at:"invalid"})).toThrow();
    expect(()=>parsePostNewsFields({related_event_id:"invalid"})).toThrow();
    expect(parsePostNewsFields({})).toEqual({});
    expect(parsePostNewsFields({show_in_news:false,news_expires_at:null,related_event_id:null})).toEqual({show_in_news:false,news_expires_at:null,related_event_id:null});
  });
});
describe("recording availability", () => {
  const event = { starts_at:"2026-10-06T10:00:00Z", ends_at:"2026-10-06T12:00:00Z", recording_expected:true };
  it("counts 48 hours from the end rather than the beginning", () => {
    expect(recordingAvailability(event,now).state).toBe("processing");
    expect(recordingAvailability(event,new Date(now.getTime()+1)).state).toBe("overdue");
  });
  it("uses actual end and respects no-recording and legacy events", () => {
    expect(recordingAvailability({...event,broadcast_sessions:[{ended_at:"2026-10-07T12:00:00Z"}]},now).state).toBe("processing");
    expect(recordingAvailability({...event,recording_expected:false},now).state).toBe("none");
    expect(recordingAvailability({...event,recording_expected:null},now).state).toBe("unknown");
  });
  it("removes the promise once published and never exposes unpublished recordings", () => {
    expect(recordingAvailability({...event,broadcast_sessions:[{recording_status:"published",recording_url:"https://youtu.be/abc"}]},now).message).toBe("");
    expect(recordingAvailability({...event,broadcast_sessions:[{recording_status:"ready",recording_url:"https://youtu.be/abc"}]},now).state).toBe("processing");
  });
  it("handles upcoming and cancelled broadcasts",()=>{
    expect(recordingAvailability({...event,starts_at:"2026-10-09T10:00:00Z",ends_at:"2026-10-09T12:00:00Z"},now).state).toBe("upcoming");
    expect(recordingAvailability({...event,status:"cancelled"},now).state).toBe("cancelled");
  });
});
