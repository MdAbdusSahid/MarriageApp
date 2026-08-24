import { useState, useEffect } from "react";
import Reveal from "./Reveal";
import { HeartIcon, Flourish } from "./Icons";

// Guest List Modal Component
function GuestListModal({ guests, onClose, onClearAll }) {
  const attending = guests.filter((g) => g.attending === "yes");
  const declining = guests.filter((g) => g.attending === "no");
  const totalGuests = attending.reduce((sum, g) => sum + g.guestCount, 0);

  const downloadJSON = () => {
    const dataStr = JSON.stringify(guests, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "wedding-guests.json";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="modal-close" onClick={onClose}>
          ×
        </button>
        <h3 className="modal-title">Guest List</h3>
        <div className="modal-stats">
          <div className="stat-box">
            <span className="stat-num">{attending.length}</span>
            <span className="stat-label">Attending</span>
          </div>
          <div className="stat-box">
            <span className="stat-num">{totalGuests}</span>
            <span className="stat-label">Total Guests</span>
          </div>
          <div className="stat-box">
            <span className="stat-num">{declining.length}</span>
            <span className="stat-label">Declined</span>
          </div>
        </div>

        {/* {guests.length > 0 && (
          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-download"
              onClick={downloadJSON}
            >
              📥 Download JSON
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => {
                if (
                  window.confirm("Are you sure you want to clear all guests?")
                ) {
                  onClearAll();
                }
              }}
            >
              🗑️ Clear All
            </button>
          </div>
        )} */}

        {guests.length === 0 ? (
          <p className="no-guests">No RSVPs yet. Be the first to respond!</p>
        ) : (
          <div className="guest-list">
            {attending.length > 0 && (
              <>
                <h4 className="list-heading attending">
                  <HeartIcon className="heading-icon" /> Attending
                </h4>
                <ul>
                  {attending.map((guest) => (
                    <li
                      key={guest.email + guest.registeredAt}
                      className="guest-item"
                      style={{
                        animationDelay: `${attending.indexOf(guest) * 0.1}s`,
                      }}
                    >
                      <div className="guest-header">
                        <span className="guest-name">{guest.name}</span>
                        <span className="guest-count-badge">
                          {guest.guestCount} guest
                          {guest.guestCount > 1 ? "s" : ""}
                        </span>
                      </div>
                      <span className="guest-email">✉ {guest.email}</span>
                      {guest.message && (
                        <p className="guest-message">"{guest.message}"</p>
                      )}
                    </li>
                  ))}
                </ul>
              </>
            )}
            {declining.length > 0 && (
              <>
                <h4 className="list-heading declining">
                  Regretfully Declining
                </h4>
                <ul>
                  {declining.map((guest) => (
                    <li
                      key={guest.email + guest.registeredAt}
                      className="guest-item declined"
                      style={{
                        animationDelay: `${(attending.length + declining.indexOf(guest)) * 0.1}s`,
                      }}
                    >
                      <div className="guest-header">
                        <span className="guest-name">{guest.name}</span>
                      </div>
                      <span className="guest-email">✉ {guest.email}</span>
                      {guest.message && (
                        <p className="guest-message">"{guest.message}"</p>
                      )}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Rsvp() {
  const [sent, setSent] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [attending, setAttending] = useState("");
  const [guestCount, setGuestCount] = useState(1);
  const [message, setMessage] = useState("");
  const [guests, setGuests] = useState([]);
  const [showModal, setShowModal] = useState(false);

  // Load guests from JSON file on mount
  useEffect(() => {
    fetch("/api/guests")
      .then((res) => res.json())
      .then((data) => setGuests(data))
      .catch(() => setGuests([]));
  }, []);

  // Save guests to JSON file
  const saveGuests = async (updatedGuests) => {
    setGuests(updatedGuests);
    await fetch("/api/guests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedGuests),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newGuest = {
      name,
      email,
      attending,
      guestCount: Number.parseInt(guestCount, 10),
      message,
      registeredAt: new Date().toISOString(),
    };

    await saveGuests([...guests, newGuest]);
    setSent(true);
  };

  const clearAllGuests = async () => {
    await saveGuests([]);
    setShowModal(false);
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
        <button
          type="button"
          className="btn btn-outline"
          onClick={() => setShowModal(true)}
          style={{ marginTop: "1rem" }}
        >
          View Guest List ({guests.length})
        </button>
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
          </p>{" "}
          <button
            type="button"
            className="btn"
            onClick={() => {
              setSent(false);
              setName("");
              setEmail("");
              setAttending("");
              setGuestCount(1);
              setMessage("");
            }}
            style={{ marginTop: "1.5rem" }}
          >
            Add Another Guest
          </button>{" "}
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="attending">Will you attend?</label>
            <select
              id="attending"
              required
              value={attending}
              onChange={(e) => setAttending(e.target.value)}
            >
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
              value={guestCount}
              onChange={(e) => setGuestCount(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="message">A Note for the Couple</label>
            <textarea
              id="message"
              rows="3"
              placeholder="Share your wishes…"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            ></textarea>
          </div>
          <button type="submit" className="btn">
            Send RSVP
          </button>
        </form>
      )}

      {showModal && (
        <GuestListModal
          guests={guests}
          onClose={() => setShowModal(false)}
          onClearAll={clearAllGuests}
        />
      )}
    </section>
  );
}
