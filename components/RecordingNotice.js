import { recordingAvailability } from "../lib/recordingAvailability";
export default function RecordingNotice({ event }) {
  const { state, message } = recordingAvailability(event);
  if (!message) return null;
  return <p role="status" className={`mt-4 rounded-xl border p-4 text-sm leading-relaxed ${state === "overdue" ? "border-amber-200 bg-amber-50 text-amber-900" : "border-slate-200 bg-slate-50 text-slate-600"}`}>{message}</p>;
}
