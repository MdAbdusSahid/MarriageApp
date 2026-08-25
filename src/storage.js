// Simple JSON storage for guest data
// Data is stored in localStorage and can be synced via JSON export/import

const STORAGE_KEY = 'wedding_guests';

// Get all guests from localStorage
export const getGuests = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading guests:', error);
    return [];
  }
};

// Save all guests to localStorage
const saveGuests = (guests) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(guests));
    return true;
  } catch (error) {
    console.error('Error saving guests:', error);
    return false;
  }
};

// Add a new guest
export const addGuest = (guestData) => {
  const guests = getGuests();
  const newGuest = {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    ...guestData,
    registeredAt: new Date().toISOString(),
  };
  guests.push(newGuest);
  saveGuests(guests);
  return newGuest;
};

// Delete a guest by ID
export const deleteGuest = (guestId) => {
  const guests = getGuests();
  const filtered = guests.filter(g => g.id !== guestId);
  return saveGuests(filtered);
};

// Clear all guests
export const clearAllGuests = () => {
  return saveGuests([]);
};

// Export guests as JSON file
export const exportGuestsJSON = () => {
  const guests = getGuests();
  const dataStr = JSON.stringify(guests, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `wedding-guests-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

// Import guests from JSON file
export const importGuestsJSON = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result);
        if (Array.isArray(imported)) {
          saveGuests(imported);
          resolve(imported.length);
        } else {
          reject(new Error('Invalid JSON format'));
        }
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
};

// Subscribe to storage changes (for cross-tab sync)
export const subscribeToChanges = (callback) => {
  const handler = (e) => {
    if (e.key === STORAGE_KEY) {
      callback(getGuests());
    }
  };
  window.addEventListener('storage', handler);
  // Return unsubscribe function
  return () => window.removeEventListener('storage', handler);
};
