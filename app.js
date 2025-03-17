const CACHE_NAME = "pwa-cache-v1";
const urlsToCache = ["/", "/index.html", "/app.js", "/style.css", "/manifest.json", "/icons/icon-192x192.png", "/icons/icon-512x512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).then((response) => {
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, response.clone());
          return response;
        });
      });
    })
  );
});

document.addEventListener("DOMContentLoaded", () => {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js").then(() => {
      console.log("Service Worker registered");
    });
  }

  const scanButton = document.getElementById("scan-button");
  const resultContainer = document.getElementById("result");
  const saveButton = document.getElementById("save-button");

  scanButton.addEventListener("click", async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      const video = document.createElement("video");
      video.srcObject = stream;
      video.setAttribute("playsinline", true);
      video.play();
      video.style.width = "100%";
      document.body.appendChild(video);
      
      setTimeout(() => {
        stream.getTracks().forEach(track => track.stop());
        document.body.removeChild(video);
        resultContainer.textContent = "Simulated Scan Result: ID123ABC"; // Placeholder for real scanning
      }, 3000);
    } catch (err) {
      console.error("Error accessing camera: ", err);
    }
  });

  saveButton.addEventListener("click", () => {
    const scannedID = resultContainer.textContent;
    if (scannedID) {
      localStorage.setItem("scannedID", scannedID);
      alert("ID saved: " + scannedID);
    }
  });
});

// HTML structure for UI
document.body.innerHTML = `
  <div style="text-align: center; padding: 20px;">
    <h1>PWA Scanner</h1>
    <button id="scan-button" style="padding: 10px 20px; font-size: 16px;">Scan ID</button>
    <p id="result" style="margin: 20px 0; font-size: 18px;"></p>
    <button id="save-button" style="padding: 10px 20px; font-size: 16px;">Save ID</button>
  </div>
`;
