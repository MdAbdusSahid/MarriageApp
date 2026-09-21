import { useState, useEffect } from "react";
import Reveal from "./Reveal";
import { HeartIcon, Flourish } from "./Icons";
import {
  getGuests,
  addGuest,
  deleteGuest as deleteGuestFromStorage,
  clearAllGuests as clearAllGuestsFromStorage,
  exportGuestsJSON,
  importGuestsJSON,
  subscribeToChanges,
} from "../storage";

const ADMIN_KEY = "wedding_admin";
const ADMIN_PASSWORD = "sahidwedding2026"; // Change this to your desired password

// Helper functions to mask sensitive data
const maskEmail = (email) => {
  if (!email) return "";
  const [localPart, domain] = email.split("@");
  if (!domain) return "***@***.***";
  const maskedLocal =
    localPart.length > 2
      ? localPart[0] +
        "*".repeat(localPart.length - 2) +
        localPart[localPart.length - 1]
      : "*".repeat(localPart.length);
  const domainParts = domain.split(".");
  const maskedDomain = domainParts
    .map((part, i) =>
      i === domainParts.length - 1 ? part : "*".repeat(part.length),
    )
    .join(".");
  return `${maskedLocal}@${maskedDomain}`;
};

const maskPhone = (phone) => {
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "");
  if (digits.length <= 4) return "*".repeat(digits.length);
  return "*".repeat(digits.length - 4) + digits.slice(-4);
};

// Guest List Modal Component
function GuestListModal({
  guests,
  onClose,
  onClearAll,
  onDeleteGuest,
  isAdmin,
  onToggleAdmin,
}) {
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const attending = guests.filter((g) => g.attending === "yes");
  const declining = guests.filter((g) => g.attending === "no");
  const totalGuests = attending.reduce((sum, g) => sum + g.guestCount, 0);

  const handleAdminToggle = () => {
    if (isAdmin) {
      onToggleAdmin();
    } else {
      setShowPasswordPrompt(true);
      setPasswordInput("");
      setPasswordError("");
    }
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      onToggleAdmin();
      setShowPasswordPrompt(false);
      setPasswordInput("");
      setPasswordError("");
    } else {
      setPasswordError("Incorrect password");
      setPasswordInput("");
    }
  };

  const downloadJSON = () => {
    exportGuestsJSON();
  };

  const handleImportJSON = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      importGuestsJSON(file)
        .then(async (count) => {
          alert(
            `Successfully imported ${count} guests\n\n` +
              `Note: To persist across devices, replace public/guests.json with this file and redeploy.`,
          );
          // Reload guests
          const updatedGuests = await getGuests();
          updatedGuests.sort(
            (a, b) => new Date(b.registeredAt) - new Date(a.registeredAt),
          );
          setGuests(updatedGuests);
        })
        .catch((error) => {
          alert(`Failed to import: ${error.message}`);
        });
    }
  };

  const displayEmail = (email) => (isAdmin ? email : maskEmail(email));
  const displayPhone = (phone) => (isAdmin ? phone : maskPhone(phone));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="modal-close" onClick={onClose}>
          ×
        </button>
        <h3 className="modal-title">Guest List</h3>

        <div className="admin-toggle">
          {isAdmin ? (
            <button
              type="button"
              className="btn btn-admin-logout"
              onClick={handleAdminToggle}
            >
              🔓 Admin View (Logout)
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-admin-login"
              onClick={handleAdminToggle}
            >
              🔒 Admin Login
            </button>
          )}
        </div>

        {showPasswordPrompt && (
          <div className="password-prompt">
            <form onSubmit={handlePasswordSubmit}>
              <label htmlFor="admin-password">Enter Admin Password</label>
              <div className="password-input-row">
                <input
                  id="admin-password"
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Password"
                  autoFocus
                />
                <button type="submit" className="btn btn-small">
                  Unlock
                </button>
                <button
                  type="button"
                  className="btn btn-small btn-cancel"
                  onClick={() => {
                    setShowPasswordPrompt(false);
                    setPasswordInput("");
                    setPasswordError("");
                  }}
                >
                  Cancel
                </button>
              </div>
              {passwordError && (
                <p className="password-error">{passwordError}</p>
              )}
            </form>
          </div>
        )}

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

        {guests.length > 0 && isAdmin && (
          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-download"
              onClick={downloadJSON}
            >
              📥 Export JSON
            </button>
            <label className="btn btn-upload">
              📤 Import JSON
              <input
                type="file"
                accept=".json"
                onChange={handleImportJSON}
                style={{ display: "none" }}
              />
            </label>
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
        )}

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
                  {attending.map((guest, index) => (
                    <li
                      key={guest.id}
                      className="guest-item"
                      style={{
                        animationDelay: `${index * 0.1}s`,
                      }}
                    >
                      <div className="guest-header">
                        <span className="guest-name">{guest.name}</span>
                        <div className="guest-header-right">
                          <span className="guest-count-badge">
                            {guest.guestCount} guest
                            {guest.guestCount > 1 ? "s" : ""}
                          </span>
                          {isAdmin && (
                            <button
                              type="button"
                              className="btn-delete-guest"
                              onClick={() => {
                                if (
                                  window.confirm(
                                    `Remove ${guest.name} from the guest list?`,
                                  )
                                ) {
                                  onDeleteGuest(guest.id);
                                }
                              }}
                              title="Remove guest"
                            >
                              ×
                            </button>
                          )}
                        </div>
                      </div>
                      <span className="guest-email">
                        ✉ {displayEmail(guest.email)}
                      </span>
                      {guest.phone && (
                        <span className="guest-phone">
                          📞 {displayPhone(guest.phone)}
                        </span>
                      )}
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
                  {declining.map((guest, index) => (
                    <li
                      key={guest.id}
                      className="guest-item declined"
                      style={{
                        animationDelay: `${(attending.length + index) * 0.1}s`,
                      }}
                    >
                      <div className="guest-header">
                        <span className="guest-name">{guest.name}</span>
                        {isAdmin && (
                          <button
                            type="button"
                            className="btn-delete-guest"
                            onClick={() => {
                              if (
                                window.confirm(
                                  `Remove ${guest.name} from the guest list?`,
                                )
                              ) {
                                onDeleteGuest(guest.id);
                              }
                            }}
                            title="Remove guest"
                          >
                            ×
                          </button>
                        )}
                      </div>
                      <span className="guest-email">
                        ✉ {displayEmail(guest.email)}
                      </span>
                      {guest.phone && (
                        <span className="guest-phone">
                          📞 {displayPhone(guest.phone)}
                        </span>
                      )}
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
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [attending, setAttending] = useState("");
  const [guestCount, setGuestCount] = useState(1);
  const [message, setMessage] = useState("");
  const [guests, setGuests] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load guests from JSON file and subscribe to changes
  useEffect(() => {
    // Load admin status from localStorage
    const adminStatus = localStorage.getItem(ADMIN_KEY);
    if (adminStatus === "true") {
      setIsAdmin(true);
    }

    // Load initial guests
    const loadGuests = async () => {
      try {
        setLoading(true);
        const guestsData = await getGuests();
        guestsData.sort(
          (a, b) => new Date(b.registeredAt) - new Date(a.registeredAt),
        );
        setGuests(guestsData);
      } catch (error) {
        console.error("Error loading guests:", error);
      } finally {
        setLoading(false);
      }
    };

    loadGuests();

    // Subscribe to changes (polls every 30 seconds)
    const unsubscribe = subscribeToChanges(loadGuests);

    return () => unsubscribe();
  }, []);

  // Toggle admin mode
  const toggleAdmin = () => {
    const newAdminStatus = !isAdmin;
    setIsAdmin(newAdminStatus);
    localStorage.setItem(ADMIN_KEY, newAdminStatus.toString());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const newGuestData = {
      name,
      email,
      phone,
      attending,
      guestCount: Number.parseInt(guestCount, 10),
      message,
    };

    try {
      const newGuest = await addGuest(newGuestData);
      console.log("Guest added successfully with ID:", newGuest.id);

      // Update local state
      const updatedGuests = await getGuests();
      updatedGuests.sort(
        (a, b) => new Date(b.registeredAt) - new Date(a.registeredAt),
      );
      setGuests(updatedGuests);

      setSent(true);
    } catch (error) {
      console.error("Error adding guest:", error);
      alert(`Failed to submit RSVP: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const clearAllGuests = async () => {
    try {
      await clearAllGuestsFromStorage();
      setGuests([]);
      setShowModal(false);
    } catch (error) {
      console.error("Error clearing guests:", error);
      alert("Failed to clear guests. Please try again.");
    }
  };

  const deleteGuest = async (guestId) => {
    try {
      await deleteGuestFromStorage(guestId);
      setGuests(guests.filter((g) => g.id !== guestId));
    } catch (error) {
      console.error("Error deleting guest:", error);
      alert("Failed to remove guest. Please try again.");
    }
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
        <p className="lead" style={{ color: "var(--muted)" }}>
          Kindly respond before November 15, 2026 so we can save you a seat at
          our table.
        </p>
        <button
          type="button"
          className="btn btn-outline"
          onClick={() => setShowModal(true)}
          style={{ marginTop: "1rem" }}
        >
          View Guest List ({loading ? "..." : guests.length})
        </button>
      </Reveal>

      {sent ? (
        <div className="thankyou">
          <HeartIcon className="heart" />
          <h3 style={{ color: "var(--ink)", fontSize: "1.8rem" }}>
            Thank you{name ? `, ${name}` : ""}!
          </h3>
          <p style={{ color: "var(--muted)" }}>
            Your response has been received. We can't wait to celebrate with
            you.
          </p>
          <button
            type="button"
            className="btn"
            onClick={() => {
              setSent(false);
              setName("");
              setEmail("");
              setPhone("");
              setAttending("");
              setGuestCount(1);
              setMessage("");
            }}
            style={{ marginTop: "1.5rem" }}
          >
            Add Another Guest
          </button>
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
            <label htmlFor="phone">Phone Number</label>
            <input
              id="phone"
              type="tel"
              required
              placeholder="+91 98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
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
          <button type="submit" className="btn" disabled={submitting}>
            {submitting ? "Sending..." : "Send RSVP"}
          </button>
        </form>
      )}

      {showModal && (
        <GuestListModal
          guests={guests}
          onClose={() => setShowModal(false)}
          onClearAll={clearAllGuests}
          onDeleteGuest={deleteGuest}
          isAdmin={isAdmin}
          onToggleAdmin={toggleAdmin}
        />
      )}
    </section>
  );
}
