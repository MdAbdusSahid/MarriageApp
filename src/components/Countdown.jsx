import { useEffect, useState } from "react";
import Reveal from "./Reveal";
import { WEDDING_DATE } from "../config";

function getRemaining() {
  const diff = WEDDING_DATE.getTime() - Date.now();
  const past = diff <= 0;
  const abs = Math.max(0, diff);
  return {
    past,
    values: {
      Days: Math.floor(abs / 86400000),
      Hours: Math.floor((abs / 3600000) % 24),
      Minutes: Math.floor((abs / 60000) % 60),
      Seconds: Math.floor((abs / 1000) % 60),
    },
  };
}

export default function Countdown() {
  const [time, setTime] = useState(getRemaining);

  useEffect(() => {
    // Tick every second. Initial value comes from useState(getRemaining).
    const id = setInterval(() => setTime(getRemaining()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <section id="countdown" className="section countdown">
      <Reveal className="section-inner">
        <span className="script">
          {time.past ? "We said" : "Counting down to forever"}
        </span>
        <h2>{time.past ? "Just Married" : "Our Big Day"}</h2>
        <div className="divider">
          <span></span>
        </div>
        <div className="count-grid">
          {Object.entries(time.values).map(([label, value]) => (
            <div className="count-box" key={label}>
              <div className="num">{String(value).padStart(2, "0")}</div>
              <div className="label">{label}</div>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
