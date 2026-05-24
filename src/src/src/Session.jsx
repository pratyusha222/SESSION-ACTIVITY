import { useEffect, useState } from "react";
import { startTracking } from "./eventTracking";
import { saveEvent } from "./storage";

export default function Session() {
  const [time, setTime] = useState(0);

  useEffect(() => {
    startTracking((event) => {
      saveEvent(event);
      console.log("EVENT:", event);
    });

    const timer = setInterval(() => {
      setTime(t => t + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div>
      <h1>Session Monitoring Active</h1>
      <h2>Time: {time}s</h2>
    </div>
  );
}