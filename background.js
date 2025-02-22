// background.js

// Function to compute the appropriate zoom for a given window
async function computeZoomForWindow(window) {
    // Define the window's rectangle.
    const winRect = {
      left: window.left,
      top: window.top,
      right: window.left + window.width,
      bottom: window.top + window.height
    };
  
    // Retrieve stored monitor profiles.
    const data = await browser.storage.local.get("profiles");
    const profiles = data.profiles || [];
    let maxArea = 0;
    let selectedZoom = 1.0; // Default zoom
  
    profiles.forEach(profile => {
      // Define the monitor's rectangle.
      const profileRect = {
        left: profile.left,
        top: profile.top,
        right: profile.left + profile.width,
        bottom: profile.top + profile.height
      };
  
      // Compute overlapping area.
      const xOverlap = Math.max(0, Math.min(winRect.right, profileRect.right) - Math.max(winRect.left, profileRect.left));
      const yOverlap = Math.max(0, Math.min(winRect.bottom, profileRect.bottom) - Math.max(winRect.top, profileRect.top));
      const area = xOverlap * yOverlap;
  
      if (area > maxArea) {
        maxArea = area;
        selectedZoom = profile.zoom;
      }
    });
  
    return selectedZoom;
  }
  
  // Define updateWindowZoom to update a single window's zoom level.
  async function updateWindowZoom(window) {
    const zoomLevel = await computeZoomForWindow(window);
    console.log(`Updating zoom for window ${window.id}: zoom=${zoomLevel}`);
  
    try {
      const tabs = await browser.tabs.query({ windowId: window.id });
      for (const tab of tabs) {
        try {
          await browser.tabs.setZoom(tab.id, zoomLevel);
        } catch (err) {
          console.error(`Failed to set zoom for tab ${tab.id}`, err);
        }
      }
    } catch (err) {
      console.error("Failed to query tabs for window", window.id, err);
    }
  }
  
  // Function to update all windows by iterating over them.
  async function updateAllWindows() {
    try {
      const windows = await browser.windows.getAll();
      for (const win of windows) {
        await updateWindowZoom(win);
      }
      console.log("All windows updated");
    } catch (err) {
      console.error("Error updating all windows:", err);
    }
  }
  
  // Expose updateAllWindows so the popup can call it.
  window.updateAllWindows = updateAllWindows;
  
  // Existing event listeners...
  
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
  
  browser.windows.onFocusChanged.addListener((windowId) => {
    if (windowId !== browser.windows.WINDOW_ID_NONE) {
      browser.windows.get(windowId).then((window) => {
        updateWindowZoom(window);
      });
    }
  });
  
  // Listener for messages (e.g., from the popup when settings are applied)
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
      return true; // indicates async response
    }
  });
  