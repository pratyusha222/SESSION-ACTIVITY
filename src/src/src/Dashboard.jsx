import { useEffect, useState } from "react";
import { getEvents } from "./storage";

export default function Dashboard() {
  const [events, setEvents] = useState([]);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    const interval = setInterval(() => {
      setEvents(getEvents());
    }, 1000); // 🔥 LIVE UPDATE (no refresh)

    return () => clearInterval(interval);
  }, []);

  const filtered = filter === "ALL"
    ? events
    : events.filter(e => e.type === filter);

  const counts = events.reduce((acc, e) => {
    acc[e.type] = (acc[e.type] || 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      <h1>📊 Live Dashboard</h1>

      {/* FILTER */}
      <select onChange={(e) => setFilter(e.target.value)}>
        <option value="ALL">All</option>
        <option value="TAB_HIDDEN">Tab Hidden</option>
        <option value="TAB_VISIBLE">Tab Visible</option>
        <option value="WINDOW_BLUR">Blur</option>
        <option value="WINDOW_FOCUS">Focus</option>
      </select>

      {/* COUNTERS */}
      <h3>Event Counts</h3>
      {Object.entries(counts).map(([k, v]) => (
        <p key={k}>{k}: {v}</p>
      ))}

      {/* TIMELINE */}
      <h3>Timeline</h3>
      {filtered.map((e, i) => (
        <div key={i}>
          <b>{e.type}</b> - {new Date(e.timestamp).toLocaleTimeString()}
        </div>
      ))}
    </div>
  );
}