import { useEffect, useState } from "react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dark, setDark] = useState(() => {
    if (typeof window === "undefined") return true;
    const saved = localStorage.getItem("theme");
    if (saved) return saved === "dark";
    return true; // Dark mode is the default.
  });

  useEffect(() => {
    const theme = dark ? "dark" : "light";
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("theme", theme);
  }, [dark]);

  const toggleTheme = (e) => {
    // Anchor the heart-shaped reveal at the button that was clicked.
    const rect = e.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    document.documentElement.style.setProperty("--reveal-x", `${x}px`);
    document.documentElement.style.setProperty("--reveal-y", `${y}px`);

    if (!document.startViewTransition) {
      setDark((d) => !d);
      return;
    }
    document.startViewTransition(() => setDark((d) => !d));
  };

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

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav
      className={`nav ${scrolled ? "scrolled" : ""} ${menuOpen ? "open" : ""}`}
    >
      <div className={`nav-links ${menuOpen ? "open" : ""}`}>
        <a href="#home" onClick={closeMenu}>
          Home
        </a>
        <a href="#story" onClick={closeMenu}>
          Our Story
        </a>
        <a href="#events" onClick={closeMenu}>
          Events
        </a>
        <a href="#gallery" onClick={closeMenu}>
          Gallery
        </a>
        <a href="#rsvp" onClick={closeMenu}>
          RSVP
        </a>
      </div>

      <div className="nav-actions">
        <button
          className={`theme-toggle ${dark ? "is-dark" : ""}`}
          onClick={toggleTheme}
          aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
          aria-pressed={dark}
          title={dark ? "Light mode" : "Dark mode"}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 21s-7.5-4.9-10-9.4C.7 8.9 1.9 5.5 5 4.6c2-.6 3.9.2 5 1.8 1.1-1.6 3-2.4 5-1.8 3.1.9 4.3 4.3 3 7C19.5 16.1 12 21 12 21z" />
          </svg>
        </button>

        <button
          className={`nav-toggle ${menuOpen ? "open" : ""}`}
          onClick={() => setMenuOpen((o) => !o)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </nav>
  );
}
