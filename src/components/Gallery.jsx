import Reveal from "./Reveal";
import { Flourish } from "./Icons";

// Uses Unsplash source photos. Swap these URLs with your own images
// (place them in /public and reference like "/photos/1.jpg").
const photos = [
  "https://images.unsplash.com/photo-1519741497674-611481863552?w=600&q=80",
  "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=600&q=80",
  "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=600&q=80",
  "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=600&q=80",
  "https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=600&q=80",
  "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600&q=80",
];

export default function Gallery() {
  return (
    <section id="gallery" className="section gallery">
      <Reveal>
        <span className="script">Captured moments</span>
        <h2>Our Gallery</h2>
        <div className="divider">
          <span></span>
          <Flourish />
          <span></span>
        </div>
      </Reveal>

      <Reveal className="section-inner">
        <div className="gallery-grid">
          {photos.map((src, i) => (
            <figure key={i}>
              <img src={src} alt={`Couple moment ${i + 1}`} loading="lazy" />
            </figure>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
