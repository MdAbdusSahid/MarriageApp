// Simple JSON storage for guest data
// Data is fetched from and saved via Vercel serverless function

const GUESTS_API = '/api/guests';
const CACHE_KEY = 'wedding_guests_cache';
const CACHE_TIMESTAMP_KEY = 'wedding_guests_cache_timestamp';
const CACHE_DURATION = 5000; // 5 seconds - reduced for faster updates

// Fetch guests from the API
export const getGuests = async () => {
  try {
    // Check cache first
    const cachedData = localStorage.getItem(CACHE_KEY);
    const cacheTimestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
    const now = Date.now();
    
    if (cachedData && cacheTimestamp && (now - parseInt(cacheTimestamp)) < CACHE_DURATION) {
      return JSON.parse(cachedData);
    }
    
    // Fetch from API with cache busting
    const response = await fetch(`${GUESTS_API}?t=${now}`);
    if (!response.ok) {
      throw new Error('Failed to fetch guests');
    }
    
    const guests = await response.json();
    
    // Update cache
    localStorage.setItem(CACHE_KEY, JSON.stringify(guests));
    localStorage.setItem(CACHE_TIMESTAMP_KEY, now.toString());
    
    return guests;
  } catch (error) {
    console.error('Error reading guests:', error);
    // Return cached data if available, otherwise empty array
    const cachedData = localStorage.getItem(CACHE_KEY);
    return cachedData ? JSON.parse(cachedData) : [];
  }
};

// Save all guests via API
const saveGuests = async (guests) => {
  try {
    console.log('Saving guests to server...', guests.length, 'guests');
    
    // Send to API
    const response = await fetch(GUESTS_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(guests),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to save guests: ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log('✅ Guests saved successfully:', result);
    
    // Update cache
    localStorage.setItem(CACHE_KEY, JSON.stringify(guests));
    localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
    
    return true;
  } catch (error) {
    console.error('Error saving guests:', error);
    // Fallback to local cache
    localStorage.setItem(CACHE_KEY, JSON.stringify(guests));
    localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
    
    alert('⚠️ Could not save to server. Data saved locally only.\n\n' +
          'Error: ' + error.message + '\n\n' +
          'Please check your internet connection and try again.');
    
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
  const filtered = guests.filter(g => g.id !== guestId);
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
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `guests-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  
  alert('✅ Backup downloaded!\n\n' +
        'Guest data is now automatically saved to the server.\n' +
        'This backup file is for your records.');
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

// Poll for changes (check the API periodically)
export const subscribeToChanges = (callback) => {
  let lastCheck = Date.now();
  
  const checkForUpdates = async () => {
    try {
      const now = Date.now();
      if (now - lastCheck > 10000) { // Check every 10 seconds
        lastCheck = now;
        // Clear cache to force fetch
        localStorage.removeItem(CACHE_KEY);
        localStorage.removeItem(CACHE_TIMESTAMP_KEY);
        const guests = await getGuests();
        callback(guests);
      }
    } catch (error) {
      console.error('Error checking for updates:', error);
    }
  };
  
  const interval = setInterval(checkForUpdates, 10000);
  
  // Also listen for storage events (cross-tab)
  const storageHandler = (e) => {
    if (e.key === CACHE_KEY) {
      checkForUpdates();
    }
  };
  window.addEventListener('storage', storageHandler);
  
  // Return unsubscribe function
  return () => {
    clearInterval(interval);
    window.removeEventListener('storage', storageHandler);
  };
};
