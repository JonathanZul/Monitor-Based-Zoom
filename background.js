// background.js

// Helper function to update zoom based on a window's center
async function updateWindowZoom(window) {
    const centerX = window.left + window.width / 2;
    const centerY = window.top + window.height / 2;
  
    // Retrieve stored monitor profiles
    const data = await browser.storage.local.get("profiles");
    const profiles = data.profiles || [];
    let appliedProfile = null;
  
    for (const profile of profiles) {
      if (
        centerX >= profile.left &&
        centerX <= profile.left + profile.width &&
        centerY >= profile.top &&
        centerY <= profile.top + profile.height
      ) {
        appliedProfile = profile;
        break;
      }
    }
  
    const zoomLevel = appliedProfile ? appliedProfile.zoom : 1.0;
    console.log(`Updating zoom for window ${window.id}: center=(${centerX}, ${centerY}), zoom=${zoomLevel}`);
  
    try {
      const tabs = await browser.tabs.query({ windowId: window.id });
      for (const tab of tabs) {
        try {
          await browser.tabs.setZoom(tab.id, zoomLevel);
        } catch (err) {
          console.error("Failed to set zoom for tab", tab.id, err);
        }
      }
    } catch (err) {
      console.error("Failed to query tabs for window", window.id, err);
    }
  }
  
  // Use onBoundsChanged if available; otherwise, fallback to polling.
  if (browser.windows.onBoundsChanged) {
    browser.windows.onBoundsChanged.addListener((win) => {
      browser.windows.get(win.id).then((window) => {
        updateWindowZoom(window);
      });
    });
  } else {
    console.log("browser.windows.onBoundsChanged is not supported. Using polling fallback.");
    const previousBounds = {};
    setInterval(async () => {
      try {
        const win = await browser.windows.getCurrent();
        if (!previousBounds[win.id]) {
          previousBounds[win.id] = { left: win.left, top: win.top, width: win.width, height: win.height };
        } else {
          const prev = previousBounds[win.id];
          if (prev.left !== win.left || prev.top !== win.top || prev.width !== win.width || prev.height !== win.height) {
            previousBounds[win.id] = { left: win.left, top: win.top, width: win.width, height: win.height };
            updateWindowZoom(win);
          }
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 1000);
  }
  
  // Also update when window focus changes.
  browser.windows.onFocusChanged.addListener((windowId) => {
    if (windowId !== browser.windows.WINDOW_ID_NONE) {
      browser.windows.get(windowId).then((window) => {
        updateWindowZoom(window);
      });
    }
  });
  
  // Listen for messages (e.g., from the popup when settings are applied)
  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "updateZoom" && message.windowId) {
      browser.windows.get(message.windowId)
        .then((window) => {
          updateWindowZoom(window);
          sendResponse({ status: "ok" });
        })
        .catch((err) => {
          console.error("Error updating zoom on message", err);
          sendResponse({ status: "error", error: err });
        });
      return true;
    }
  });
  