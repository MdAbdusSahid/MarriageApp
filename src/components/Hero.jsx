import { ChevronDown } from "./Icons";
import { COUPLE } from "../config";

// Generate randomised petals once (lightweight CSS-only elements).
const petals = Array.from({ length: 10 }, (_, i) => ({
  id: i,
  left: Math.random() * 100,
  size: 10 + Math.random() * 14,
  duration: 9 + Math.random() * 8,
  delay: Math.random() * 8,
}));

export default function Hero() {
  return (
    <header id="home" className="hero">
      <div className="petals" aria-hidden="true">
        {petals.map((p) => (
          <span
            key={p.id}
            className="petal"
            style={{
              left: `${p.left}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
      </div>

      <div className="hero-content">
        <p className="pre">Together with their families</p>
        <h1 className="names">{COUPLE.bride}</h1>
        <span className="amp">&amp;</span>
        <h1 className="names">{COUPLE.groom}</h1>
        <p className="date">{COUPLE.dateLabel}</p>
        <p className="place">{COUPLE.venue}</p>
      </div>

      <a href="#countdown" className="scroll-cue" aria-label="Scroll down">
        <ChevronDown width="28" height="28" />
      </a>
    </header>
  );
}
