import { useEffect, useState } from "react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        // Only update state when the value actually flips to avoid re-renders.
        setScrolled((prev) => {
          const next = window.scrollY > 60;
          return prev === next ? prev : next;
        });
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className={`nav ${scrolled ? "scrolled" : ""}`}>
      <a href="#home">Home</a>
      <a href="#story">Our Story</a>
      <a href="#events">Events</a>
      <a href="#gallery">Gallery</a>
      <a href="#rsvp">RSVP</a>
    </nav>
  );
}
