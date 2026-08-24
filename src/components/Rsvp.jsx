import { useState } from "react";
import Reveal from "./Reveal";
import { HeartIcon, Flourish } from "./Icons";

export default function Rsvp() {
  const [sent, setSent] = useState(false);
  const [name, setName] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // Hook this up to your backend / email service (e.g. Formspree, EmailJS).
    setSent(true);
  };

  return (
    <section id="rsvp" className="section rsvp">
      <Reveal>
        <span className="script">Will you celebrate with us?</span>
        <h2>RSVP</h2>
        <div className="divider">
          <span></span>
          <Flourish />
          <span></span>
        </div>
        <p className="lead" style={{ color: "#e9e2d9" }}>
          Kindly respond before November 15, 2026 so we can save you a seat at
          our table.
        </p>
      </Reveal>

      {sent ? (
        <div className="thankyou">
          <HeartIcon className="heart" />
          <h3 style={{ color: "#fff", fontSize: "1.8rem" }}>
            Thank you{name ? `, ${name}` : ""}!
          </h3>
          <p style={{ color: "#e9e2d9" }}>
            Your response has been received. We can’t wait to celebrate with
            you.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              type="text"
              required
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              required
              placeholder="you@email.com"
            />
          </div>
          <div>
            <label htmlFor="attending">Will you attend?</label>
            <select id="attending" required defaultValue="">
              <option value="" disabled>
                Please choose
              </option>
              <option value="yes">Joyfully accepts</option>
              <option value="no">Regretfully declines</option>
            </select>
          </div>
          <div>
            <label htmlFor="guests">Number of Guests</label>
            <input
              id="guests"
              type="number"
              min="1"
              max="10"
              defaultValue="1"
            />
          </div>
          <div>
            <label htmlFor="message">A Note for the Couple</label>
            <textarea
              id="message"
              rows="3"
              placeholder="Share your wishes…"
            ></textarea>
          </div>
          <button type="submit" className="btn">
            Send RSVP
          </button>
        </form>
      )}
    </section>
  );
}
