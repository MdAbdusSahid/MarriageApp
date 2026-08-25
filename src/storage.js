// Simple JSON storage for guest data
// Data is fetched from and saved via Vercel serverless function

const GUESTS_API = "/api/guests";
const CACHE_KEY = "wedding_guests_cache";
const CACHE_TIMESTAMP_KEY = "wedding_guests_cache_timestamp";
const CACHE_DURATION = 5000; // 5 seconds - reduced for faster updates

// Fetch guests from localStorage
export const getGuests = async () => {
  try {
    const cachedData = localStorage.getItem(CACHE_KEY);
    return cachedData ? JSON.parse(cachedData) : [];
  } catch (error) {
    console.error("Error reading guests:", error);
    return [];
  }
};

// Save all guests (localStorage only for now - simple and reliable)
const saveGuests = async (guests) => {
  try {
    console.log("Saving guests...", guests.length, "guests");

    // Save to localStorage
    localStorage.setItem(CACHE_KEY, JSON.stringify(guests));
    localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());

    console.log("✅ Guests saved successfully");
    return true;
  } catch (error) {
    console.error("Error saving guests:", error);
    alert("⚠️ Could not save guest data.\n\nError: " + error.message);
    return false;
  }
};

// Add a new guest
export const addGuest = async (guestData) => {
  const guests = await getGuests();
  const newGuest = {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    ...guestData,
    registeredAt: new Date().toISOString(),
  };
  guests.push(newGuest);
  await saveGuests(guests);
  return newGuest;
};

// Delete a guest by ID
export const deleteGuest = async (guestId) => {
  const guests = await getGuests();
  const filtered = guests.filter((g) => g.id !== guestId);
  return await saveGuests(filtered);
};

// Clear all guests
export const clearAllGuests = async () => {
  return await saveGuests([]);
};

// Export guests as JSON file (backup purposes)
export const exportGuestsJSON = async () => {
  const guests = await getGuests();
  const dataStr = JSON.stringify(guests, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `guests-backup-${new Date().toISOString().split("T")[0]}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);

  alert(
    "✅ Backup downloaded!\n\n" +
      "Guest data is saved in your browser.\n" +
      "Keep this backup file for your records!",
  );
};

// Import guests from JSON file
export const importGuestsJSON = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const imported = JSON.parse(e.target.result);
        if (Array.isArray(imported)) {
          await saveGuests(imported);
          // Clear cache to force reload
          localStorage.removeItem(CACHE_KEY);
          localStorage.removeItem(CACHE_TIMESTAMP_KEY);
          resolve(imported.length);
        } else {
          reject(new Error("Invalid JSON format"));
        }
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
};

// Listen for storage changes (cross-tab sync)
export const subscribeToChanges = (callback) => {
  // Listen for storage events from other tabs
  const storageHandler = async (e) => {
    if (e.key === CACHE_KEY) {
      const guests = await getGuests();
      callback(guests);
    }
  };
  window.addEventListener("storage", storageHandler);

  // Return unsubscribe function
  return () => {
    window.removeEventListener("storage", storageHandler);
  };
};
