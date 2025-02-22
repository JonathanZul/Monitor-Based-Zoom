async function getMonitorResolution() {
    return `${window.screen.availWidth}x${window.screen.availHeight}`;
}

async function applyZoomToMonitor() {
    let resolutionKey = await getMonitorResolution();
    let settings = await browser.storage.local.get();
    let zoomFactor = settings[resolutionKey] || 1.0;

    let allTabs = await browser.tabs.query({});
    let currentWindow = await browser.windows.getCurrent();

    // Get the monitor position of the current window
    let monitorLeft = currentWindow.left;
    let monitorTop = currentWindow.top;

    for (let tab of allTabs) {
        let tabWindow = await browser.windows.get(tab.windowId);
        
        // Only apply zoom to tabs in the same monitor
        if (tabWindow.left === monitorLeft && tabWindow.top === monitorTop) {
            await browser.tabs.setZoom(tab.id, zoomFactor);
        }
    }
}

// Apply zoom on tab updates
browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete") {
        applyZoomToMonitor();
    }
});

// Apply zoom when a new window is created
browser.windows.onCreated.addListener(() => {
    applyZoomToMonitor();
});

// Detect resolution changes
window.addEventListener("resize", () => {
    applyZoomToMonitor();
});
