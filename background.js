// Initialize state when extension is installed
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({
    focusMode: false,
    allowedTabs: [],
    timerEnd: null,
    passwordProtection: false,
    blocklist: []
  });
});

// Listen for tab creation
chrome.tabs.onCreated.addListener((tab) => {
  chrome.storage.local.get(['focusMode', 'allowedTabs'], (result) => {
    if (result.focusMode) {
      // Close the new tab if focus mode is enabled
      chrome.tabs.remove(tab.id);
      
      // Notify the user why the tab was closed
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'images/icon128.png',
        title: 'Focus Mode Active',
        message: 'New tabs are blocked while focus mode is active.',
        priority: 2
      });
    }
  });
});

// Listen for tab updates to check for blocked websites
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Only run when the URL changes
  if (changeInfo.url) {
    chrome.storage.local.get(['blocklist'], (result) => {
      const blocklist = result.blocklist || [];
      
      if (blocklist.length > 0) {
        // Check if the URL matches any blocklisted domain
        const url = changeInfo.url.toLowerCase();
        
        for (const blockedSite of blocklist) {
          if (url.includes(blockedSite.toLowerCase())) {
            // Redirect to a blocked page
            chrome.tabs.update(tabId, { url: chrome.runtime.getURL('blocked.html') });
            
            // Notify the user
            chrome.notifications.create({
              type: 'basic',
              iconUrl: 'images/icon128.png',
              title: 'Website Blocked',
              message: `${blockedSite} is on your blocklist.`,
              priority: 2
            });
            
            break;
          }
        }
      }
    });
  }
});

// Handle alarm (timer complete)
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'focusModeTimer') {
    // Turn off focus mode when timer ends
    chrome.storage.local.set({
      focusMode: false,
      timerEnd: null
    });
    
    // Notify the user that focus mode has ended
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'images/icon128.png',
      title: 'Focus Time Completed',
      message: 'Your focus session has ended. You can now open new tabs.',
      priority: 2
    });
  }
});

// Listen for changes to storage to update badge
chrome.storage.onChanged.addListener((changes) => {
  if (changes.focusMode) {
    if (changes.focusMode.newValue) {
      // Focus mode enabled - set badge
      chrome.action.setBadgeText({ text: 'ON' });
      chrome.action.setBadgeBackgroundColor({ color: '#4285F4' });
    } else {
      // Focus mode disabled - clear badge
      chrome.action.setBadgeText({ text: '' });
    }
  }
}); 