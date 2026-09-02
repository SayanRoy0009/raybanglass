# Smart Optical Media Normalizer 🕶️

A lightweight, zero-latency browser utility engineered to conform digital photographs to wearable optical hardware standards. Automatically re-samples portrait aspect ratios to 3024×4032, scrubs hardware serials and positioning telemetry, patches wearable device metadata profiles, and triggers local image export with zero server intervention.

---

## ⚡ Core Capabilities

* **Unified Single-Action Pipeline:** Normalizes dimensions, wipes metadata, injects hardware tags, and launches file export in one step.
* **Aspect & Resolution Calibration:** Automatically rotates EXIF orientations and renders canvas buffers to the native 3024 × 4032 vertical profile.
* **Privacy & Telemetry Sanitization:** Strips embedded GPS coordinates, camera maker signatures, and lens serial keys before applying the target device profile.
* **Zero-Cloud Architecture:** 100% in-browser execution utilizing HTML5 Canvas and client-side EXIF manipulation. Raw media never traverses external networks.
* **Real-Time Analytics:** Integrated lightweight metric tracking to monitor global user sessions and conversion totals without user tracking cookies.
* **Cross-Platform Responsive UI:** Mobile-optimized dark interface supporting drag-and-drop on desktop and direct camera roll/share sheet access on handhelds.

---

## 🛠️ Architecture & Object Model

The codebase is organized into decoupled layers using standard JavaScript inheritance for maintainability:

```text
raybanglass/
├── index.html                  # Interface layout & script orchestration
├── style.css                   # Minimalist dark dashboard styling
└── js/
    ├── ImageProcessor.js       # Base class: Canvas math, orientation & blob helpers
    ├── MetaGlassesConverter.js # Derived class: Device profile constants & EXIF builder
    └── app.js                  # UI controllers, telemetry, and event handlers
