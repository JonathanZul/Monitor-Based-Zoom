document.addEventListener("DOMContentLoaded", async function () {
    let resolutionDropdown = document.getElementById("resolutionList");
    let zoomInput = document.getElementById("zoom");
    let saveButton = document.getElementById("save");

    // Load existing monitor profiles
    let settings = await browser.storage.local.get();
    let keys = Object.keys(settings);

    resolutionDropdown.innerHTML = keys.map(res => `<option value="${res}">${res}</option>`).join("");

    // Auto-select current resolution
    let currentResolution = `${window.screen.availWidth}x${window.screen.availHeight}`;
    if (!settings[currentResolution]) {
        settings[currentResolution] = 1.0; // Default zoom for new monitors
        await browser.storage.local.set(settings);
    }
    resolutionDropdown.value = currentResolution;
    zoomInput.value = settings[currentResolution];

    // Update zoom when selection changes
    resolutionDropdown.addEventListener("change", () => {
        zoomInput.value = settings[resolutionDropdown.value] || 1.0;
    });

    // Save zoom level
    saveButton.addEventListener("click", async () => {
        let selectedResolution = resolutionDropdown.value;
        let newZoom = parseFloat(zoomInput.value);

        if (newZoom >= 0.5 && newZoom <= 3) {
            await browser.storage.local.set({ [selectedResolution]: newZoom });
            alert("Zoom level saved!");
        } else {
            alert("Zoom must be between 0.5 and 3.0");
        }
    });
});
