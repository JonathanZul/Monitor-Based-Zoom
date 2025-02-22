document.addEventListener("DOMContentLoaded", async function () {
    let resolutionKey = `${window.screen.availWidth}x${window.screen.availHeight}`;
    let zoomSlider = document.getElementById("zoomSlider");
    let zoomValueText = document.getElementById("zoomValue");
    let saveButton = document.getElementById("save");

    let settings = await browser.storage.local.get();
    let zoomFactor = settings[resolutionKey] || 1.0;

    document.getElementById("currentResolution").textContent = `Resolution: ${resolutionKey}`;
    zoomSlider.value = zoomFactor;
    zoomValueText.textContent = Math.round(zoomFactor * 100);

    // Apply zoom dynamically as slider moves
    zoomSlider.addEventListener("input", async () => {
        let newZoom = parseFloat(zoomSlider.value);
        zoomValueText.textContent = Math.round(newZoom * 100);

        let allTabs = await browser.tabs.query({});
        let currentWindow = await browser.windows.getCurrent();

        let monitorLeft = currentWindow.left;
        let monitorTop = currentWindow.top;

        for (let tab of allTabs) {
            let tabWindow = await browser.windows.get(tab.windowId);
            
            if (tabWindow.left === monitorLeft && tabWindow.top === monitorTop) {
                await browser.tabs.setZoom(tab.id, newZoom);
            }
        }
    });

    // Save zoom setting when button is clicked
    saveButton.addEventListener("click", async () => {
        let newZoom = parseFloat(zoomSlider.value);
        await browser.storage.local.set({ [resolutionKey]: newZoom });
        alert("Zoom level saved!");
    });
});
