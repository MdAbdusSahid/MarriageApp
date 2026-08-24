import Reveal from "./Reveal";
import { Flourish } from "./Icons";

const milestones = [
  {
    when: "Spring 2019",
    title: "How We Met",
    text: "A chance meeting at a friend’s book café turned a rainy afternoon into the beginning of everything.",
  },
  {
    when: "Summer 2021",
    title: "Our First Trip",
    text: "Winding roads, mountain sunsets, and endless conversations — we knew this was forever.",
  },
  {
    when: "Winter 2024",
    title: "The Proposal",
    text: "Under a sky full of fairy lights, one question changed our lives with a joyful “yes”.",
  },
  {
    when: "December 2026",
    title: "The Wedding",
    text: "And now, surrounded by the people we love, we begin our happily ever after.",
  },
];

export default function Story() {
  return (
    <section id="story" className="section story">
      <Reveal>
        <span className="script">Every love story is beautiful</span>
        <h2>Our Journey</h2>
        <div className="divider">
          <span></span>
          <Flourish />
          <span></span>
        </div>
        <p className="lead">
          From a single hello to a lifetime of togetherness — here is a glimpse
          of the moments that brought us here.
        </p>
      </Reveal>

      <div className="timeline">
        {milestones.map((m) => (
          <Reveal key={m.title}>
            <div className="story-item">
              <div className="card">
                <p className="when">{m.when}</p>
                <h3>{m.title}</h3>
                <p>{m.text}</p>
              </div>
              <span className="dot"></span>
              <div className="spacer"></div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
