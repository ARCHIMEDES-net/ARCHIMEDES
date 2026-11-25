// Vysílání, která jsou výjimečně zdarma pro všechny školy.
// Klíč = id události (events.id), hodnota = veřejný registrační odkaz z WebMeetingu.
// Registrace přes tento odkaz nevyžaduje účet ani licenci na platformě;
// odkaz na připojení pošle WebMeeting e-mailem.
export const FREE_BROADCAST_REGISTRATION = {
  // Miss World 2024 Krystyna Pyszková a Money Monsters, 26. 11. 2026 10:30
  "432eb4fa-264f-4533-96fd-b981d168dfa2":
    "https://admin.webmeeting.cz/enrol/enrol/20275?code=186fd2f6",
};

export function freeRegistrationUrlFor(eventId) {
  if (!eventId) return "";
  return FREE_BROADCAST_REGISTRATION[String(eventId)] || "";
}
