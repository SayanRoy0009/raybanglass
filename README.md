# RayBan Meta Smart Glasses Photo Converter 🕶️

A simple, fast web tool that makes any photo look like it was taken with smart glasses. It resizes your image to 3024×4032, removes private info like GPS location, adds smart glasses camera details to the file, and lets you download the result right away. Everything happens directly on your device—no uploads, no servers.

---

## ⚡ What It Does

* **1-Click Conversion:** Resizes the image, cleans the data, adds camera tags, and downloads it in one go.
* **Smart Glasses Size:** Rotates your image upright and fits it to the standard vertical size (3024 × 4032).
* **Privacy First:** Cleans out your GPS location, phone model, and serial numbers before saving.
* **100% In Your Browser:** Uses standard browser tools to process images on your device. Your photos are never sent to any server.
* **Simple Live Counter:** Shows how many people visited and how many photos have been converted without using any tracking cookies.
* **Works Everywhere:** Clean dark layout that works smoothly on phones, tablets, and desktop computers.

---

## 🛠️ Project Structure

The project is split into clean, easy-to-read files using plain JavaScript:

```text
raybanglass/
├── index.html                  # Main page layout
├── style.css                   # Dark theme design
└── js/
    ├── ImageProcessor.js       # Base helper for image resizing and rotation
    ├── MetaGlassesConverter.js # Adds the smart glasses camera data
    └── app.js                  # Buttons, download triggers, and counter logic




### How the Code Works

1. **Pick & Load:** The user selects or snaps a JPEG photo. The browser reads it as a local data URL.
2. **Rotate & Resize:** `ImageProcessor` checks the photo's original EXIF orientation, rotates it right-side up, and draws it onto a canvas scaled to 3024×4032.
3. **Clean & Inject:** `MetaGlassesConverter` deletes original phone details and GPS coordinates, then inserts the smart glasses camera make and model tags.
4. **Save & Count:** The app triggers an automatic `.jpg` download to your device and ticks the public conversion counter up by one.
