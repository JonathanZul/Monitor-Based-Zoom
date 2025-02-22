// debugOverlay.js

// Log immediately to verify the content script is injected.
console.log("debugOverlay.js loaded");

// Our main initialization function for the debug overlay.
function initDebugOverlay() {
  console.log("Initializing debug overlay...");

  // Retrieve monitor profiles from storage.
  browser.storage.local.get("profiles")
    .then(({ profiles }) => {
      if (!profiles || profiles.length === 0) {
        console.log("No monitor profiles found for debugging overlay.");
        return;
      }
      
      console.log("Monitor profiles found:", profiles);
      
      // Get the browser window's position and size.
      const winScreenX = window.screenX;
      const winScreenY = window.screenY;
      const winWidth = window.innerWidth;
      const winHeight = window.innerHeight;
      
      // Define the visible browser window rectangle in screen coordinates.
      const winRect = {
        left: winScreenX,
        top: winScreenY,
        right: winScreenX + winWidth,
        bottom: winScreenY + winHeight
      };
      
      // For each monitor profile, compute the intersection with the window.
      profiles.forEach(profile => {
        // Monitor rectangle from profile (in screen coordinates).
        const monitorRect = {
          left: profile.left,
          top: profile.top,
          right: profile.left + profile.width,
          bottom: profile.top + profile.height
        };
        
        // Compute intersection between the window and the monitor.
        const intersection = {
          left: Math.max(winRect.left, monitorRect.left),
          top: Math.max(winRect.top, monitorRect.top),
          right: Math.min(winRect.right, monitorRect.right),
          bottom: Math.min(winRect.bottom, monitorRect.bottom)
        };
        
        if (intersection.left < intersection.right && intersection.top < intersection.bottom) {
          // Compute coordinates relative to the window's content area.
          const relativeRect = {
            left: intersection.left - winRect.left,
            top: intersection.top - winRect.top,
            width: intersection.right - intersection.left,
            height: intersection.bottom - intersection.top
          };
          
          // Create an overlay element with a red border.
          const overlay = document.createElement("div");
          overlay.style.position = "fixed";
          overlay.style.left = `${relativeRect.left}px`;
          overlay.style.top = `${relativeRect.top}px`;
          overlay.style.width = `${relativeRect.width}px`;
          overlay.style.height = `${relativeRect.height}px`;
          overlay.style.border = "2px solid red";
          overlay.style.pointerEvents = "none"; // So it doesn't block interactions.
          overlay.style.zIndex = 999999;
          overlay.style.boxSizing = "border-box";
          
          // Optionally, add a label with the monitor's name.
          const label = document.createElement("div");
          label.textContent = profile.name || "Monitor";
          label.style.position = "absolute";
          label.style.top = "0px";
          label.style.left = "0px";
          label.style.backgroundColor = "rgba(255,0,0,0.7)";
          label.style.color = "white";
          label.style.fontSize = "12px";
          label.style.padding = "2px 4px";
          overlay.appendChild(label);
          
          document.body.appendChild(overlay);
          console.log(`Overlay added for profile: ${profile.name}`);
        } else {
          console.log(`No intersection for profile: ${profile.name}`);
        }
      });
    })
    .catch((err) => {
      console.error("Error retrieving profiles in debug overlay:", err);
    });
}

// Check if the DOM is already loaded; if so, run immediately.
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initDebugOverlay);
} else {
  initDebugOverlay();
}
