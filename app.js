document.addEventListener("DOMContentLoaded", () => {
    const video = document.getElementById("video");
    const canvas = document.getElementById("canvas");
    const scanButton = document.getElementById("scanButton");

    async function startCamera() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "environment" }
            });
            video.srcObject = stream;
            video.onloadedmetadata = () => {
                video.play();
            };
        } catch (error) {
            console.error("Kameran käyttö estetty:", error);
            alert("Ei pääsyä kameraan! Tarkista oikeudet.");
        }
    }

    // 📷 Ota kuva ja käsittele OCR:llä
    scanButton.addEventListener("click", () => {
        captureFrame();
    });

    function captureFrame() {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // 📷 Kuvan esikäsittely
        let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        let processedData = preprocessImage(imageData);
        ctx.putImageData(processedData, 0, 0);
        
        let imageURL = canvas.toDataURL("image/png");

        recognizeText(imageURL);
    }

    function preprocessImage(imageData) {
        let data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            let r = data[i];
            let g = data[i + 1];
            let b = data[i + 2];

            // 🖤 Muunna harmaasävyksi (Luma-menetelmä)
            let gray = 0.299 * r + 0.587 * g + 0.114 * b;

            // ⚡ Paranna kontrastia
            let threshold = 150; // Voit säätää tätä
            let binary = gray > threshold ? 255 : 0;

            data[i] = data[i + 1] = data[i + 2] = binary;
        }

        return imageData;
    }

    // 🔍 Käytä OCR:ää tekstin tunnistamiseen
    function recognizeText(imageData) {
        const result = document.getElementById("result");
        result.innerText = "Tunnistetaan ID:tä...";
        Tesseract.recognize(
            imageData,
            "fin", // Voit lisätä muita kieliä (esim. "fin" suomi)
            {
                logger: m => console.log(m),
                tessedit_char_whitelist: "SIN0123456789" // Estetään turhat merkit
            }
        ).then(({ data: { text } }) => {
            let cleanedText = extractValidID(text);
            if (cleanedText) {
                result.innerText = "Luettu ID: " + cleanedText;
                saveID(cleanedText);
            } else {
                result.innerText = "Ei kelvollista ID:tä löytynyt.";
            }
        }).catch(error => {
            console.error("OCR epäonnistui", error);
            result.innerText = "Virhe OCR-käsittelyssä!";
        });
    }

    function extractValidID(text) {
        // 🧹 Puhdistetaan OCR-tulokset (poistetaan välilyönnit ja muut roskat)
        let cleanedText = text.replace(/\s+/g, "").trim();

        // 🔍 Etsitään kelvollinen 16-numeroinen ID, jossa voi olla "SIN" edessä
        let match = cleanedText.match(/(?:SIN)?(\d{16})/);
        return match ? match[0] : null;
    }

    // 💾 Tallenna ID localStorageen
    function saveID(id) {
        let ids = JSON.parse(localStorage.getItem("savedIDs")) || [];
        ids.unshift(id);
        localStorage.setItem("savedIDs", JSON.stringify(ids));
        renderIDList();
    }

    // 📜 Näytä tallennetut ID:t
    function renderIDList() {
        const idList = document.getElementById("idList");
        idList.innerHTML = "";
        let ids = JSON.parse(localStorage.getItem("savedIDs")) || [];
        ids.forEach(id => {
            let li = document.createElement("li");
            li.textContent = id;
            idList.appendChild(li);
        });
    }

    startCamera();
    renderIDList();
});
