import Reveal from "./Reveal";
import { RingsIcon, GlassIcon, CameraIcon, Flourish } from "./Icons";

const events = [
  {
    Icon: CameraIcon,
    title: "Mehndi & Sangeet",
    time: "Dec 11, 2026 · 6:00 PM",
    place: "The Rosewood Courtyard",
    map: "https://maps.google.com",
  },
  {
    Icon: RingsIcon,
    title: "The Ceremony",
    time: "Dec 12, 2026 · 4:00 PM",
    place: "The Rosewood Garden Lawn",
    map: "https://maps.google.com",
  },
  {
    Icon: GlassIcon,
    title: "Reception",
    time: "Dec 12, 2026 · 8:00 PM",
    place: "The Grand Ballroom",
    map: "https://maps.google.com",
  },
];

export default function Events() {
  return (
    <section id="events" className="section details">
      <Reveal>
        <span className="script">Join the celebration</span>
        <h2>Wedding Events</h2>
        <div className="divider">
          <span></span>
          <Flourish />
          <span></span>
        </div>
      </Reveal>

      <Reveal className="section-inner">
        <div className="event-grid">
          {events.map(({ Icon, title, time, place, map }) => (
            <div className="event-card" key={title}>
              <Icon className="icon" />
              <h3>{title}</h3>
              <p className="time">{time}</p>
              <p>{place}</p>
              <a href={map} target="_blank" rel="noreferrer">
                View Map
              </a>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
