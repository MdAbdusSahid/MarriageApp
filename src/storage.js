// Guest data storage using MongoDB via Vercel Function

const GUESTS_API = "/api/guests";
const CACHE_KEY = "wedding_guests_cache";
const CACHE_TIMESTAMP_KEY = "wedding_guests_cache_timestamp";
const CACHE_DURATION = 10000; // 10 seconds cache

// Fetch guests from API (MongoDB)
export const getGuests = async () => {
  try {
    // Check cache first
    const cached = localStorage.getItem(CACHE_KEY);
    const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
    
    if (cached && timestamp) {
      const age = Date.now() - parseInt(timestamp);
      if (age < CACHE_DURATION) {
        return JSON.parse(cached);
      }
    }
    
    // Fetch from API
    const response = await fetch(GUESTS_API);
    if (!response.ok) {
      throw new Error('Failed to fetch guests');
    }
    
    const data = await response.json();
    const guests = Array.isArray(data) ? data : [];
    
    // Update cache
    localStorage.setItem(CACHE_KEY, JSON.stringify(guests));
    localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
    
    return guests;
  } catch (error) {
    console.error("Error fetching guests:", error);
    
    // Fallback to cached data if available
    const cached = localStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached) : [];
  }
};

// Save all guests to cache (for local updates)
const saveGuests = async (guests) => {
  try {
    console.log("Updating cache...", guests.length, "guests");

    // Update cache immediately for responsiveness
    localStorage.setItem(CACHE_KEY, JSON.stringify(guests));
    localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());

    console.log("✅ Cache updated");
    return true;
  } catch (error) {
    console.error("Error updating cache:", error);
    return false;
  }
};

// Add a new guest
export const addGuest = async (guestData) => {
  const newGuest = {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    ...guestData,
    registeredAt: new Date().toISOString(),
  };
  
  try {
    console.log("🔄 Saving guest to MongoDB...", newGuest);
    console.log("📍 API URL:", GUESTS_API);
    console.log("🌐 Full URL:", window.location.origin + GUESTS_API);
    
    // Save to MongoDB via API
    const response = await fetch(GUESTS_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newGuest),
    });
    
    console.log("📡 Response status:", response.status, response.statusText);
    
    if (!response.ok) {
      const responseText = await response.text();
      console.error("❌ Response body:", responseText);
      
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch {
        errorData = { error: responseText || 'Failed to save guest' };
      }
      
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log("✅ Guest saved to MongoDB!", result);
    
    // Update local cache
    const guests = await getGuests();
    const guestsArray = Array.isArray(guests) ? guests : [];
    guestsArray.push(newGuest);
    await saveGuests(guestsArray);
    
    // Clear cache timestamp to force refresh on next read
    localStorage.removeItem(CACHE_TIMESTAMP_KEY);
    
    return newGuest;
  } catch (error) {
    console.error('❌ Error adding guest:', error);
    alert("⚠️ Could not save to database.\n\nError: " + error.message + "\n\nCheck browser console (F12) for details.");
    throw error;
  }
};

// Delete a guest by ID
export const deleteGuest = async (guestId) => {
  try {
    // Delete from MongoDB via API
    const response = await fetch(`${GUESTS_API}?id=${guestId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete guest');
    }
    
    // Update local cache
    const guests = await getGuests();
    const filtered = guests.filter((g) => g.id !== guestId);
    await saveGuests(filtered);
    
    // Clear cache to force refresh on next read
    localStorage.removeItem(CACHE_TIMESTAMP_KEY);
    
    return true;
  } catch (error) {
    console.error('Error deleting guest:', error);
    // Fallback to local deletion
    const guests = await getGuests();
    const filtered = guests.filter((g) => g.id !== guestId);
    return await saveGuests(filtered);
  }
};

// Clear all guests
export const clearAllGuests = async () => {
  try {
    // Clear from MongoDB via API
    const response = await fetch(`${GUESTS_API}?action=clear`, {
      method: 'PUT',
    });
    
    if (!response.ok) {
      throw new Error('Failed to clear guests');
    }
    
    // Clear local cache
    await saveGuests([]);
    localStorage.removeItem(CACHE_TIMESTAMP_KEY);
    
    return true;
  } catch (error) {
    console.error('Error clearing guests:', error);
    return await saveGuests([]);
  }
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
