import { useReveal } from "../hooks/useReveal";

export default function Reveal({ children, className = "", style }) {
  const [ref, visible] = useReveal();
  return (
    <div
      ref={ref}
      style={style}
      className={`reveal ${visible ? "visible" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
