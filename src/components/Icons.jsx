// Small inline SVG icon set — no external icon dependency needed.

export const HeartIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 21s-6.7-4.35-9.33-8.24C.9 9.9 2.2 6.5 5.4 6c1.9-.3 3.6.7 4.6 2 1-1.3 2.7-2.3 4.6-2 3.2.5 4.5 3.9 2.73 6.76C18.7 16.65 12 21 12 21z" />
  </svg>
);

export const RingsIcon = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    {...props}
  >
    <circle cx="9" cy="14" r="6" />
    <circle cx="15" cy="14" r="6" />
    <path d="M9 3l2 3H7l2-3z" fill="currentColor" stroke="none" />
  </svg>
);

export const ChurchIcon = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    {...props}
  >
    <path d="M12 2v6M9 5h6" />
    <path d="M12 8l7 5v9H5v-9l7-5z" />
    <path d="M10 22v-4a2 2 0 014 0v4" />
  </svg>
);

export const GlassIcon = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    {...props}
  >
    <path d="M8 2h8l-1 7a3 3 0 01-6 0L8 2z" />
    <path d="M12 12v8M8 22h8" />
  </svg>
);

export const CameraIcon = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    {...props}
  >
    <path d="M4 7h3l2-2h6l2 2h3v13H4V7z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);

export const ChevronDown = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    {...props}
  >
    <path d="M6 9l6 6 6-6" />
  </svg>
);

export const Flourish = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 2c1 3 3 5 6 6-3 1-5 3-6 6-1-3-3-5-6-6 3-1 5-3 6-6z" />
  </svg>
);
