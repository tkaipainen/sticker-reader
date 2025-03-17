const CACHE_NAME = "pwa-cache-v1";
const urlsToCache = ["/", "/index.html", "/main.js", "/style.css"];

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
      return response || fetch(event.request);
    })
  );
});

document.addEventListener("DOMContentLoaded", () => {
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
