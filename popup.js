// popup.js
document.addEventListener("DOMContentLoaded", () => {
  loadProfiles();
  document.getElementById("add-profile").addEventListener("click", addProfileUI);
  document.getElementById("apply-changes").addEventListener("click", () => {
    saveProfiles().then(() => {
      // Hide the apply button after saving changes
      document.getElementById("apply-changes").style.display = "none";
    });
  });
});

// Call this function whenever a change is made that isn’t yet saved.
function markModified() {
  document.getElementById("apply-changes").style.display = "block";
}

function loadProfiles() {
  browser.storage.local.get("profiles").then((data) => {
    const profiles = data.profiles || [];
    const container = document.getElementById("profiles-container");
    container.innerHTML = "";
    profiles.forEach((profile) => {
      const profileDiv = createProfileElement(profile);
      container.appendChild(profileDiv);
    });
  });
}

function createProfileElement(profile) {
  const profileDiv = document.createElement("div");
  profileDiv.className = "profile";
  profileDiv.setAttribute("data-id", profile.id);
  profileDiv.innerHTML = `
    <h2>
      <input type="text" class="profile-name" value="${profile.name}" placeholder="Monitor Name">
    </h2>
    <label>Left:
      <input type="number" class="profile-left" value="${profile.left}" />
    </label>
    <label>Top:
      <input type="number" class="profile-top" value="${profile.top}" />
    </label>
    <label>Width:
      <input type="number" class="profile-width" value="${profile.width}" />
    </label>
    <label>Height:
      <input type="number" class="profile-height" value="${profile.height}" />
    </label>
    <label>Zoom:
      <div class="zoom-group">
        <input type="range" class="profile-zoom-range" min="50" max="200" value="${profile.zoom * 100}">
        <input type="number" class="profile-zoom-input" min="50" max="200" value="${profile.zoom * 100}">
        <span>%</span>
      </div>
    </label>
    <button class="calibrate-profile">Calibrate Monitor</button>
    <button class="delete-profile">Delete</button>
  `;

  // When any input changes, mark the configuration as modified.
  const inputs = profileDiv.querySelectorAll("input");
  inputs.forEach((input) => {
    input.addEventListener("change", markModified);
    // Sync slider and number input for zoom.
    if (input.classList.contains("profile-zoom-range")) {
      input.addEventListener("input", () => {
        profileDiv.querySelector(".profile-zoom-input").value = input.value;
        markModified();
      });
    }
    // For the numeric zoom input:
    if (input.classList.contains("profile-zoom-input")) {
      // Use 'change' instead of 'input' so partial typing isn't clamped immediately.
      input.addEventListener("change", () => {
        let value = parseInt(input.value, 10);
        if (isNaN(value)) {
          value = 100; // default if invalid
        }
        if (value < 50) {
          value = 50;
        }
        if (value > 200) {
          value = 200;
        }
        input.value = value;
        profileDiv.querySelector(".profile-zoom-range").value = value;
        markModified();
      });
    }
  });

  // "Calibrate Monitor" button uses the current window bounds to update the profile.
  profileDiv.querySelector(".calibrate-profile").addEventListener("click", () => {
    browser.windows.getCurrent().then((win) => {
      profileDiv.querySelector(".profile-left").value = win.left;
      profileDiv.querySelector(".profile-top").value = win.top;
      profileDiv.querySelector(".profile-width").value = win.width;
      profileDiv.querySelector(".profile-height").value = win.height;
      markModified();
    });
  });

  // "Delete" button removes the profile element from the UI.
  profileDiv.querySelector(".delete-profile").addEventListener("click", () => {
    profileDiv.remove();
    markModified();
  });

  return profileDiv;
}

function addProfileUI() {
  // Create a new profile with default values.
  const newProfile = {
    id: "profile-" + Date.now(),
    name: "New Monitor",
    left: 0,
    top: 0,
    width: 1920,
    height: 1080,
    zoom: 1.0 // 100%
  };
  const container = document.getElementById("profiles-container");
  const profileDiv = createProfileElement(newProfile);
  container.appendChild(profileDiv);
  markModified();
}

function saveProfiles() {
  const container = document.getElementById("profiles-container");
  const profileDivs = container.querySelectorAll(".profile");
  const profiles = [];
  
  profileDivs.forEach((div) => {
    const id = div.getAttribute("data-id");
    const name = div.querySelector(".profile-name").value;
    const left = parseInt(div.querySelector(".profile-left").value, 10);
    const top = parseInt(div.querySelector(".profile-top").value, 10);
    const width = parseInt(div.querySelector(".profile-width").value, 10);
    const height = parseInt(div.querySelector(".profile-height").value, 10);
    const zoomValue = parseInt(div.querySelector(".profile-zoom-range").value, 10);
    const zoom = zoomValue / 100;
    
    profiles.push({ id, name, left, top, width, height, zoom });
  });
  
  return browser.storage.local.set({ profiles }).then(() => {
    notifyZoomUpdate();
  });
}

function notifyZoomUpdate() {
  browser.runtime.getBackgroundPage().then((bgPage) => {
    if (bgPage && typeof bgPage.updateAllWindows === "function") {
      bgPage.updateAllWindows();
    } else {
      console.error("Background page or updateAllWindows not available");
    }
  }).catch((error) => {
    console.error("notifyZoomUpdate error:", error);
  });
}
