const KEY = "session_events";

export function saveEvent(event) {
  const old = JSON.parse(localStorage.getItem(KEY) || "[]");
  old.push(event);
  localStorage.setItem(KEY, JSON.stringify(old));
  // send event to dashboard server for live tracking (non-blocking)
  try {
    fetch('/api/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
      keepalive: true
    }).catch(()=>{});
  } catch (e) {
    // ignore network errors in client
  }
}

export function getEvents() {
  return JSON.parse(localStorage.getItem(KEY) || "[]");
}

export function clearEvents() {
  localStorage.removeItem(KEY);
}