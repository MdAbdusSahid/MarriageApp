// Simple JSON storage for guest data
// Data is fetched from and saved to a public JSON file

const GUESTS_URL = '/guests.json';
const CACHE_KEY = 'wedding_guests_cache';
const CACHE_TIMESTAMP_KEY = 'wedding_guests_cache_timestamp';
const CACHE_DURATION = 30000; // 30 seconds

// Fetch guests from the JSON file
export const getGuests = async () => {
  try {
    // Check cache first
    const cachedData = localStorage.getItem(CACHE_KEY);
    const cacheTimestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
    const now = Date.now();
    
    if (cachedData && cacheTimestamp && (now - parseInt(cacheTimestamp)) < CACHE_DURATION) {
      return JSON.parse(cachedData);
    }
    
    // Fetch from server with cache busting
    const response = await fetch(`${GUESTS_URL}?t=${now}`);
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

// Save all guests to the JSON file (simulated - needs server-side implementation)
const saveGuests = async (guests) => {
  try {
    // In a real implementation, this would POST to a server endpoint
    // For now, we'll use localStorage as a temporary solution
    // and show a warning that this needs server-side implementation
    
    console.warn('⚠️ Saving to JSON file requires server-side implementation');
    console.log('Guest data to save:', guests);
    
    // Cache the data locally
    localStorage.setItem(CACHE_KEY, JSON.stringify(guests));
    localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
    
    // Show instructions to user
    alert('⚠️ Important: To persist data across devices, you need to:\n\n' +
          '1. Download the JSON file using the Export button\n' +
          '2. Replace public/guests.json with the downloaded file\n' +
          '3. Redeploy your website\n\n' +
          'Alternatively, implement a server-side API to save the data automatically.');
    
    return true;
  } catch (error) {
    console.error('Error saving guests:', error);
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

// Export guests as JSON file (for manual deployment)
export const exportGuestsJSON = async () => {
  const guests = await getGuests();
  const dataStr = JSON.stringify(guests, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'guests.json';
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  
  alert('✅ Downloaded guests.json\n\n' +
        'To update the website:\n' +
        '1. Replace public/guests.json with this file\n' +
        '2. Run: npm run build\n' +
        '3. Redeploy your website\n\n' +
        'All devices will then see the updated guest list!');
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

// Poll for changes (check the JSON file periodically)
export const subscribeToChanges = (callback) => {
  let lastCheck = Date.now();
  
  const checkForUpdates = async () => {
    try {
      const now = Date.now();
      if (now - lastCheck > 30000) { // Check every 30 seconds
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
  
  const interval = setInterval(checkForUpdates, 30000);
  
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
