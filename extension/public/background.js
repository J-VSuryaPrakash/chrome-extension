let activeTabId = null;
let activeStartTime = null;
let localSiteData = [];
let blockedSites = [];
let blockedSitesPromise = null;
let isInitialized = false;

const MAX_SITE_DATA_ENTRIES = 1000;
const MIN_TRACKING_TIME = 1;
const CLEANUP_INTERVAL = 24 * 60 * 60 * 1000;

chrome.runtime.onStartup.addListener(initExtension);
chrome.runtime.onInstalled.addListener(initExtension);

async function initExtension() {
  if (isInitialized) return;

  try {
    await loadSiteDataFromStorage();
    blockedSitesPromise = initializeBlockedSites();
    await blockedSitesPromise;
    setupPeriodicCleanup();
    isInitialized = true;
  } catch (error) {
    console.error("Failed to initialize extension:", error);
  }
}

async function initializeBlockedSites() {
  try {
    await fetchBlockedSites();
    if (blockedSites.length === 0) {
      blockedSites = getDefaultBlockedSites();
    }
    await updateBlockingRules(blockedSites);
  } catch (error) {
    blockedSites = getDefaultBlockedSites();
    await updateBlockingRules(blockedSites);
  }
}

async function fetchBlockedSites() {
  try {
    const res = await fetch("http://localhost:8000/api/v1/blocklist/get-blocked-sites", {
      method: "GET",
      credentials: "include",
      headers: { 'Content-Type': 'application/json' }
    });

    if (res.ok) {
      const data = await res.json();
      if (data.blockedSites && Array.isArray(data.blockedSites)) {
        blockedSites = data.blockedSites.map(site => normalizeUrl(site.siteurl || site)).filter(Boolean);
      }
    } else {
      throw new Error(`Backend responded with status: ${res.status}`);
    }
  } catch (error) {
    throw error;
  }
}

function getDefaultBlockedSites() {
  return ["facebook.com", "twitter.com", "instagram.com", "tiktok.com", "reddit.com"];
}

function normalizeUrl(url) {
  try {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

function getSiteName(siteUrl) {
  const parts = siteUrl.split(".").filter(Boolean);
  return parts.length >= 2 ? parts[parts.length - 2] : siteUrl;
}

function isValidHttpUrl(url) {
  return url && (url.startsWith("http://") || url.startsWith("https://"));
}

function isSiteBlocked(url) {
  try {
    const hostname = normalizeUrl(url);
    const siteName = getSiteName(hostname);
    return blockedSites.some(blocked => hostname === blocked || siteName === blocked || hostname.endsWith('.' + blocked) || blocked.endsWith('.' + hostname));
  } catch {
    return false;
  }
}

function getOrCreateSiteEntry(siteName, siteUrl) {
  if (!siteName || !siteUrl) return null;
  let existing = localSiteData.find(s => s.siteUrl === siteUrl);
  if (!existing) {
    existing = { siteName, siteUrl, timeSpent: 0, lastVisited: Date.now(), visitCount: 0 };
    localSiteData.push(existing);
    if (localSiteData.length > MAX_SITE_DATA_ENTRIES) cleanupOldEntries();
  }
  existing.lastVisited = Date.now();
  existing.visitCount += 1;
  return existing;
}

function cleanupOldEntries() {
  localSiteData.sort((a, b) => (a.lastVisited || 0) - (b.lastVisited || 0));
  localSiteData = localSiteData.slice(-MAX_SITE_DATA_ENTRIES);
  saveSiteDataToStorage();
}

function setupPeriodicCleanup() {
  setInterval(cleanupOldEntries, CLEANUP_INTERVAL);
}

async function saveSiteDataToStorage() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set({ siteData: localSiteData, lastUpdated: Date.now() }, () => {
      if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
      else resolve();
    });
  });
}

async function loadSiteDataFromStorage() {
  return new Promise(resolve => {
    chrome.storage.local.get(["siteData"], result => {
      if (result.siteData && Array.isArray(result.siteData)) {
        localSiteData = result.siteData.filter(item => item && typeof item.siteName === 'string' && typeof item.siteUrl === 'string' && typeof item.timeSpent === 'number');
      } else {
        localSiteData = [];
      }
      resolve();
    });
  });
}

async function trackTime(tabId) {
  if (!tabId || !activeStartTime || !isInitialized) return;
  if (blockedSitesPromise) await blockedSitesPromise;

  try {
    const tab = await chrome.tabs.get(tabId);
    if (!tab || !tab.url || !isValidHttpUrl(tab.url) || isSiteBlocked(tab.url)) return;

    const siteUrl = normalizeUrl(tab.url);
    const siteName = getSiteName(siteUrl);
    const now = Date.now();
    if (!activeStartTime || activeStartTime > now) {
      activeStartTime = now;
      return;
    }

    const timeSpentSeconds = Math.floor((now - activeStartTime) / 1000);
    if (timeSpentSeconds > 86400) {
      activeStartTime = now;
      return;
    }

    if (timeSpentSeconds >= MIN_TRACKING_TIME) {
      const siteEntry = getOrCreateSiteEntry(siteName, siteUrl);
      if (siteEntry) {
        siteEntry.timeSpent += timeSpentSeconds;
        if (siteEntry.timeSpent > 86400 * 365) siteEntry.timeSpent = timeSpentSeconds;
        await saveSiteDataToStorage();
      }
    }
  } catch {}
}

chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  await trackTime(activeTabId);
  activeTabId = tabId;
  activeStartTime = Date.now();
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (tab.active && changeInfo.url && isValidHttpUrl(changeInfo.url)) {
    await trackTime(activeTabId);
    activeTabId = tabId;
    activeStartTime = Date.now();
  }
});

chrome.windows.onFocusChanged.addListener(async (windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    await trackTime(activeTabId);
    activeStartTime = null;
  } else {
    const [activeTab] = await chrome.tabs.query({ active: true, windowId });
    if (activeTab) {
      activeTabId = activeTab.id;
      activeStartTime = Date.now();
    }
  }
});

chrome.runtime.onSuspend.addListener(async () => {
  await trackTime(activeTabId);
  await saveSiteDataToStorage();
});

if (!isInitialized) {
  initExtension();
}