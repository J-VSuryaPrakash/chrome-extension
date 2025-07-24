let activeTabId = null;
let activeStartTime = null;
let localSiteData = []; // Array of { siteName, siteUrl, timeSpent }
let blockedSites = [];
let blockedSitesPromise = null;
let isInitialized = false;

// Configuration
const MAX_SITE_DATA_ENTRIES = 1000;
const MIN_TRACKING_TIME = 1; // Minimum seconds to track
const CLEANUP_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours

// 🔄 Initialize extension
chrome.runtime.onStartup.addListener(initExtension);
chrome.runtime.onInstalled.addListener(initExtension);

async function initExtension() {
  if (isInitialized) return;
  
  console.log("🚀 Initializing extension...");
  
  try {
    // Load existing data first
    await loadSiteDataFromStorage();
    
    // Initialize blocked sites
    blockedSitesPromise = initializeBlockedSites();
    await blockedSitesPromise;
    
    // Set up periodic cleanup
    setupPeriodicCleanup();
    
    isInitialized = true;
    console.log("✅ Extension initialized successfully");
  } catch (error) {
    console.error("❌ Failed to initialize extension:", error);
  }
}

// 🛑 Initialize blocked sites with fallback
async function initializeBlockedSites() {
  try {
    // Try to fetch from backend first
    await fetchBlockedSites();
    
    if (blockedSites.length === 0) {
      // Fallback to default blocked sites if backend fails
      console.warn("⚠️ No blocked sites from backend, using defaults");
      blockedSites = getDefaultBlockedSites();
    }
    
    await updateBlockingRules(blockedSites);
    console.log("🛑 Blocked sites initialized:", blockedSites);
  } catch (error) {
    console.error("❌ Failed to initialize blocked sites:", error);
    // Use defaults on error
    blockedSites = getDefaultBlockedSites();
    await updateBlockingRules(blockedSites);
  }
}

// 🛑 Fetch blocked sites from backend
async function fetchBlockedSites() {
  try {
    const res = await fetch("http://localhost:8000/api/v1/blocklist/get-blocked-sites", {
      method: "GET",
      credentials: "include",
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (res.ok) {
      const data = await res.json();
      if (data.blockedSites && Array.isArray(data.blockedSites)) {
        blockedSites = data.blockedSites
          .map(site => normalizeUrl(site.siteurl || site))
          .filter(Boolean); // Remove any invalid URLs
        
        console.log("🛑 Blocked Sites Loaded from backend:", blockedSites);
      }
    } else {
      throw new Error(`Backend responded with status: ${res.status}`);
    }
  } catch (error) {
    console.error("❌ Failed to fetch blocked sites from backend:", error);
    throw error;
  }
}

// 🛑 Default blocked sites fallback
function getDefaultBlockedSites() {
  return [
    "facebook.com",
    "twitter.com",
    "instagram.com",
    "tiktok.com",
    "reddit.com"
  ];
}

// 🌐 Utility functions
function normalizeUrl(url) {
  try {
    if (!url) return null;
    
    // Handle URLs that might not have protocol
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    
    const hostname = new URL(url).hostname.replace(/^www\./, "");
    return hostname;
  } catch (error) {
    console.warn("⚠️ Invalid URL:", url);
    return null;
  }
}

function getSiteName(siteUrl) {
  if (!siteUrl) return null;
  
  const parts = siteUrl.split(".").filter(Boolean);
  if (parts.length >= 2) {
    return parts[parts.length - 2];
  }
  return siteUrl;
}

function isValidHttpUrl(url) {
  return url && (url.startsWith("http://") || url.startsWith("https://"));
}

// 🔍 Check if site is blocked
function isSiteBlocked(url) {
  if (!url || !isValidHttpUrl(url)) return false;
  
  try {
    const hostname = normalizeUrl(url);
    if (!hostname) return false;
    
    const siteName = getSiteName(hostname);
    
    return blockedSites.some(blocked => {
      return hostname === blocked || 
             siteName === blocked ||
             hostname.endsWith('.' + blocked) ||
             blocked.endsWith('.' + hostname);
    });
  } catch (error) {
    console.warn("⚠️ Error checking if site is blocked:", error);
    return false;
  }
}

// 🔧 Get or create site entry with validation
function getOrCreateSiteEntry(siteName, siteUrl) {
  if (!siteName || !siteUrl) {
    console.warn("⚠️ Invalid site data:", { siteName, siteUrl });
    return null;
  }
  
  let existing = localSiteData.find((s) => s.siteUrl === siteUrl);
  if (!existing) {
    existing = { 
      siteName, 
      siteUrl, 
      timeSpent: 0,
      lastVisited: Date.now(),
      visitCount: 0
    };
    localSiteData.push(existing);
    
    // Cleanup if we exceed max entries
    if (localSiteData.length > MAX_SITE_DATA_ENTRIES) {
      cleanupOldEntries();
    }
  }
  
  existing.lastVisited = Date.now();
  existing.visitCount = (existing.visitCount || 0) + 1;
  
  return existing;
}

// 🧹 Cleanup old entries
function cleanupOldEntries() {
  console.log("🧹 Cleaning up old site data entries...");
  
  // Sort by last visited (oldest first) and keep only recent entries
  localSiteData.sort((a, b) => (a.lastVisited || 0) - (b.lastVisited || 0));
  localSiteData = localSiteData.slice(-MAX_SITE_DATA_ENTRIES);
  
  saveSiteDataToStorage();
}

// ⏰ Setup periodic cleanup
function setupPeriodicCleanup() {
  setInterval(() => {
    cleanupOldEntries();
  }, CLEANUP_INTERVAL);
}

// 💾 Enhanced storage functions
async function saveSiteDataToStorage() {
  return new Promise((resolve, reject) => {
    const dataToSave = {
      siteData: localSiteData,
      lastUpdated: Date.now()
    };
    
    chrome.storage.local.set(dataToSave, () => {
      if (chrome.runtime.lastError) {
        console.error("❌ Error saving site data:", chrome.runtime.lastError.message);
        reject(chrome.runtime.lastError);
      } else {
        console.log("💾 Site data saved successfully\n",localSiteData);
        resolve();
      }
    });
  });
}

async function loadSiteDataFromStorage() {
  return new Promise((resolve) => {
    chrome.storage.local.get(["siteData", "lastUpdated"], (result) => {
      if (chrome.runtime.lastError) {
        console.error("❌ Error loading site data:", chrome.runtime.lastError.message);
        localSiteData = [];
      } else if (result.siteData && Array.isArray(result.siteData)) {
        // Validate loaded data
        localSiteData = result.siteData.filter(item => 
          item && 
          typeof item.siteName === 'string' && 
          typeof item.siteUrl === 'string' && 
          typeof item.timeSpent === 'number'
        );
        console.log("📂 Loaded site data:", localSiteData.length, "entries");
      } else {
        localSiteData = [];
        console.log("📂 No existing site data found, starting fresh");
      }
      resolve();
    });
  });
}

// ⏱️ Enhanced time tracking with bug fixes
async function trackTime(tabId) {
  if (!tabId || !activeStartTime || !isInitialized) return;

  // Wait for blocked sites to be ready
  if (blockedSitesPromise) {
    await blockedSitesPromise;
  }

  try {
    const tab = await chrome.tabs.get(tabId);
    if (!tab || !tab.url || !isValidHttpUrl(tab.url)) return;

    // Skip blocked sites
    if (isSiteBlocked(tab.url)) {
      console.log(`⏱️ Skipping tracking for blocked site: ${tab.url}`);
      return;
    }

    const siteUrl = normalizeUrl(tab.url);
    if (!siteUrl) return;
    
    const siteName = getSiteName(siteUrl);
    if (!siteName) return;

    const now = Date.now();
    
    // 🐛 FIX: Ensure we have a valid start time and calculate difference properly
    if (!activeStartTime || activeStartTime > now) {
      console.warn("⚠️ Invalid activeStartTime, resetting...");
      activeStartTime = now;
      return;
    }
    
    const timeSpentMs = now - activeStartTime;
    const timeSpentSeconds = Math.floor(timeSpentMs / 1000);

    // 🐛 FIX: Add sanity check for reasonable time spent (max 24 hours)
    const MAX_SESSION_TIME = 24 * 60 * 60; // 24 hours in seconds
    if (timeSpentSeconds > MAX_SESSION_TIME) {
      console.warn(`⚠️ Unreasonable time spent (${timeSpentSeconds}s), skipping...`);
      activeStartTime = now; // Reset start time
      return;
    }

    if (timeSpentSeconds >= MIN_TRACKING_TIME) {
      console.log(`⏱️ Time spent on ${siteUrl}: ${timeSpentSeconds}s (${timeSpentMs}ms)`);
      
      const siteEntry = getOrCreateSiteEntry(siteName, siteUrl);
      if (siteEntry) {
        // 🐛 FIX: Ensure timeSpent is always in seconds, not milliseconds
        siteEntry.timeSpent = (siteEntry.timeSpent || 0) + timeSpentSeconds;
        
        // 🐛 FIX: Add validation to prevent timestamp corruption
        if (siteEntry.timeSpent > MAX_SESSION_TIME * 365) { // More than a year's worth
          console.error(`❌ Corrupted timeSpent detected for ${siteUrl}: ${siteEntry.timeSpent}`);
          siteEntry.timeSpent = timeSpentSeconds; // Reset to current session time
        }
        
        await saveSiteDataToStorage();
      }
    }
  } catch (err) {
    console.warn("❌ Could not track time:", err);
  }
}

// 🧠 Enhanced tab listeners
chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  await trackTime(activeTabId);
  activeTabId = tabId;
  activeStartTime = Date.now();

  try {
    const tab = await chrome.tabs.get(tabId);
    if (tab && tab.url && isValidHttpUrl(tab.url)) {
      const site = normalizeUrl(tab.url);
      console.log(`🌟 Switched to ${site} at ${new Date().toLocaleTimeString()}`);
    }
  } catch (err) {
    console.warn("❌ Could not get new tab:", err);
  }
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (tab.active && changeInfo.url && isValidHttpUrl(changeInfo.url)) {
    await trackTime(activeTabId);
    activeTabId = tabId;
    activeStartTime = Date.now();

    const site = normalizeUrl(changeInfo.url);
    console.log(`🌟 Updated tab to ${site} at ${new Date().toLocaleTimeString()}`);
  }
});

// Handle window focus changes
chrome.windows.onFocusChanged.addListener(async (windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    // Browser lost focus
    await trackTime(activeTabId);
    activeStartTime = null;
  } else {
    // Browser gained focus
    try {
      const [activeTab] = await chrome.tabs.query({ active: true, windowId });
      if (activeTab) {
        activeTabId = activeTab.id;
        activeStartTime = Date.now();
      }
    } catch (err) {
      console.warn("❌ Could not handle window focus change:", err);
    }
  }
});

// 🔐 Handle user login - sync data and refresh blocked sites
async function handleUserLogin() {
  console.log("🔐 User login detected, syncing data...");
  
  try {
    // First, push current tracked data to DB
    await pushSiteDataToDB();
    
    // Then fetch fresh blocked sites
    await fetchBlockedSites();
    await updateBlockingRules(blockedSites);
    
    // Finally, clear local site data since it's now in DB
    await clearLocalSiteData();
    
    console.log("✅ Login sync completed successfully");
    return { success: true };
  } catch (error) {
    console.error("❌ Login sync failed:", error);
    return { success: false, error: error.message };
  }
}

// 📤 Push tracked site data to database
// In background.js

async function pushSiteDataToDB() {
    if (!localSiteData || localSiteData.length === 0) {
        console.log("📤 No site data to push");
        return;
    }

    console.log(`📤 Pushing ${localSiteData.length} site entries to DB individually...`);

    // Use Promise.allSettled to send requests concurrently and handle individual failures
    const pushPromises = localSiteData.map(async (site) => {
        try {
            // Filter and send only required fields for THIS SINGLE site
            const payload = {
                siteName: site.siteName, // Match backend's 'sitename'
                siteUrl: site.siteUrl,   // Match backend's 'siteurl'
                timeSpent: site.timeSpent
            };

            console.log(`📤 Sending single site entry: ${payload.sitename} - ${payload.timeSpent}s`);

            const response = await fetch("http://localhost:8000/api/v1/reports/log-time", {
                method: "POST",
                credentials: "include",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload) // Sending single object payload
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Server responded with status ${response.status} for ${payload.sitename}. Body: ${errorText}`);
            }

            const result = await response.json();
            console.log(`✅ Site data for ${payload.sitename} pushed to DB successfully:`, result);
            return { siteName: payload.sitename, success: true };

        } catch (error) {
            console.error(`❌ Failed to push site data for ${site.siteName} to DB:`, error);
            return { siteName: site.siteName, success: false, error: error.message };
        }
    });

    // Wait for all individual pushes to complete (or settle)
    const results = await Promise.allSettled(pushPromises);
    
    // Log overall summary
    const successfulPushes = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
    const failedPushes = results.length - successfulPushes;

    if (failedPushes === 0) {
        console.log(`✅ All ${successfulPushes} site entries pushed to DB successfully.`);
    } else {
        console.warn(`⚠️ Completed pushing site data. Successful: ${successfulPushes}, Failed: ${failedPushes}.`);
        // Optionally, re-throw if ALL failed or a specific error requires it
        // Or handle re-queueing of failed entries if that's desired behavior
    }
}

// 🧹 Clear local site data after successful DB sync
async function clearLocalSiteData() {
  console.log("🧹 Clearing local site data...");
  
  localSiteData = [];
  
  try {
    await saveSiteDataToStorage();
    console.log("✅ Local site data cleared successfully");
  } catch (error) {
    console.error("❌ Failed to clear local site data:", error);
    throw error;
  }
}

// 📥 Fetch and merge site data from DB (optional - for when user wants to see history)
async function fetchSiteDataFromDB() {
  try {
    console.log("📥 Fetching site data from DB...");
    
    const response = await fetch("http://localhost:8000/api/v1/tracking/get-site-data", {
      method: "GET",
      credentials: "include",
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Server responded with status: ${response.status}`);
    }

    const result = await response.json();
    console.log("📥 Site data fetched from DB:", result);
    
    return result.siteData || [];
    
  } catch (error) {
    console.error("❌ Failed to fetch site data from DB:", error);
    throw error;
  }
}

// 💬 Enhanced message handling
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case "GET_SITE_DATA":
      sendResponse({
        success: true,
        data: localSiteData,
        totalSites: localSiteData.length
      });
      break;
      
    case "USER_LOGIN":
      // Handle user login - sync data and refresh blocked sites
      handleUserLogin().then((result) => {
        sendResponse(result);
      }).catch((error) => {
        sendResponse({ success: false, error: error.message });
      });
      return true; // Async response
      
    case "USER_LOGOUT":
      // On logout, we might want to keep tracking but clear any user-specific data
      console.log("🔓 User logout detected");
      // Optionally clear blocked sites or switch to default ones
      blockedSites = getDefaultBlockedSites();
      updateBlockingRules(blockedSites).then(() => {
        sendResponse({ success: true });
      }).catch((error) => {
        sendResponse({ success: false, error: error.message });
      });
      return true; // Async response
      
    case "SYNC_TO_DB":
      // Manual sync trigger
      pushSiteDataToDB().then(() => {
        sendResponse({ success: true });
      }).catch((error) => {
        sendResponse({ success: false, error: error.message });
      });
      return true; // Async response
      
    case "FETCH_FROM_DB":
      // Fetch historical data from DB
      fetchSiteDataFromDB().then((dbData) => {
        sendResponse({ success: true, data: dbData });
      }).catch((error) => {
        sendResponse({ success: false, error: error.message });
      });
      return true; // Async response
      
    case "REFRESH_BLOCKED_SITES":
      blockedSitesPromise = initializeBlockedSites();
      blockedSitesPromise.then(() => {
        sendResponse({ success: true, blockedSites });
      }).catch((error) => {
        sendResponse({ success: false, error: error.message });
      });
      return true; // Async response
      
    case "GET_BLOCKED_SITES":
      sendResponse({ success: true, blockedSites });
      break;
      
    case "CLEAR_SITE_DATA":
      // Add data validation before clearing
      console.log("🧹 Clearing site data. Current data:", localSiteData.map(site => ({
        siteName: site.siteName,
        siteUrl: site.siteUrl,
        timeSpent: site.timeSpent,
        isCorrupted: site.timeSpent > (24 * 60 * 60 * 365) // Flag if more than a year
      })));
      
      clearLocalSiteData().then(() => {
        sendResponse({ success: true });
      }).catch((error) => {
        sendResponse({ success: false, error: error.message });
      });
      return true; // Async response
      
    case "FIX_CORRUPTED_DATA":
      // New message type to fix corrupted timestamps
      const fixedData = localSiteData.map(site => {
        if (site.timeSpent > (24 * 60 * 60 * 365)) { // More than a year
          console.warn(`🔧 Fixing corrupted data for ${site.siteUrl}: ${site.timeSpent} -> 0`);
          return { ...site, timeSpent: 0 };
        }
        return site;
      });
      
      localSiteData = fixedData;
      saveSiteDataToStorage().then(() => {
        sendResponse({ success: true, fixedEntries: fixedData.length });
      }).catch((error) => {
        sendResponse({ success: false, error: error.message });
      });
      return true; // Async response
      
    default:
      sendResponse({ success: false, error: "Unknown message type" });
  }
});

// 🧱 Enhanced blocking rules with better error handling
async function updateBlockingRules(domains = []) {
  if (!Array.isArray(domains) || domains.length === 0) {
    console.log("🧱 No domains to block");
    return;
  }

  try {
    // Remove existing rules first
    const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
    const existingRuleIds = existingRules.map(rule => rule.id);
    
    if (existingRuleIds.length > 0) {
      await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: existingRuleIds
      });
    }

    // Create new rules
    const rules = domains
      .filter(domain => domain && typeof domain === 'string')
      .map((domain, i) => ({
        id: i + 1,
        priority: 1,
        action: { type: "block" },
        condition: {
          urlFilter: `||${domain}^`,
          resourceTypes: ["main_frame"]
        }
      }));

    if (rules.length > 0) {
      await chrome.declarativeNetRequest.updateDynamicRules({
        addRules: rules
      });
      
      console.log("✅ Blocking rules updated for:", domains);
    }
  } catch (error) {
    console.error("❌ Error updating blocking rules:", error);
    throw error;
  }
}

// 🔄 Handle extension lifecycle
chrome.runtime.onSuspend.addListener(async () => {
  console.log("💤 Extension suspending, saving final data...");
  await trackTime(activeTabId);
  await saveSiteDataToStorage();
});

// Initialize extension when script loads
if (!isInitialized) {
  initExtension();
}