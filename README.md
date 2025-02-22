# Dynamic Monitor Zoom

**Dynamic Monitor Zoom** is a Firefox extension designed to adjust zoom levels dynamically based on the monitor where a window is located. It allows users to calibrate each monitor by capturing its screen boundaries and then set a desired zoom level per monitor. The extension uses a simple card-based UI for adding, calibrating, and managing monitor profiles.

> **Note:** This project is a **work in progress** and is not yet ready for production. Expect incomplete features, bugs, and a lack of polish. Contributions and feedback are welcome!

---

## Features

- **Monitor Calibration:**  
  Move your browser window to a monitor, then click "Calibrate Monitor" to capture its boundaries.

- **Profile Management:**  
  Add new monitor profiles, enter a custom name, and save calibration details. Saved profiles display additional zoom controls.

- **Dynamic Zoom Adjustment:**  
  When you click "Apply Changes," the extension updates the zoom level for each window based on the monitor it occupies.

- **Debugging Overlays:**  
  For development purposes, red overlays are injected onto pages to visually represent monitor boundaries and help debug zoom behavior.

---

## Installation

1. Clone or download the repository.
2. In Firefox, open `about:debugging#/runtime/this-firefox`.
3. Click on **Load Temporary Add-on…** and select the `manifest.json` file from the project directory.
4. The extension icon should appear in the toolbar. Click it to open the popup and start calibrating your monitors.

---

## Usage

1. **Add a Monitor Profile:**  
   Click the **Add Monitor Profile** button to create a new profile.

2. **Calibrate and Save:**  
   - Move your browser window to the desired monitor.
   - Click **Calibrate Monitor** to automatically fill in the monitor’s boundaries.
   - Enter a custom monitor name.
   - Click **Save Monitor** to persist the calibration details.  
     (Zoom controls will appear only after the profile is saved.)

3. **Adjust Zoom:**  
   Once the profile is saved, use the slider or type directly into the numeric field to set your desired zoom level.

4. **Apply Zoom Changes:**  
   When you modify the zoom level of any saved profile, click **Apply Changes** to update the zoom settings across all windows.

---

## Known Issues

- **Site-Specific Zoom:**  
  Firefox applies zoom on a per-site basis by default. This extension currently relies on Firefox’s built-in APIs, which may lead to unexpected behavior if the same site is open in multiple windows.

- **User Input Validation:**  
  Numeric input for zoom levels is validated on field change. This may affect user experience when typing multi-digit values. Future updates may improve the validation flow.

- **Work in Progress:**  
  Many features (such as robust per-tab zoom adjustments and handling complex multi-monitor setups) are still under development. Expect bugs and incomplete functionality.

---

## Roadmap

- **Improve Zoom Isolation:**  
  Investigate methods to ensure zoom settings apply strictly on a per-window basis.

- **Enhanced Calibration Flow:**  
  Refine the calibration process to allow more intuitive monitor mapping and support multiple monitors more seamlessly.

- **UI/UX Enhancements:**  
  Further polish the user interface based on user feedback.

- **Testing and Stability:**  
  Increase testing across different operating systems and monitor setups.

---

## Contributing

Contributions, bug reports, and suggestions are welcome! Since this project is still in early development, please feel free to fork the repository and submit pull requests.

---

> **Disclaimer:** This project is experimental and intended for development and testing purposes only. Use at your own risk.

