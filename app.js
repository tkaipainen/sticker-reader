document.addEventListener("DOMContentLoaded", () => {
    const video = document.getElementById("video");
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");
    const processedCanvas = document.getElementById("processedCanvas");
    const processedCtx = processedCanvas.getContext("2d");
    const scanButton = document.getElementById("scanButton");

    async function startCamera() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "environment", focusMode: "continuous" }
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
        // 🔄 Lisää animaatio napille
        scanButton.classList.add("loading");
        scanButton.innerHTML = '<i class="material-icons">autorenew</i> Skannaa...';
        scanButton.disabled = true;

        captureFrame();
    });

    function captureFrame() {
       canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        //let processedData = preprocessImage(imageData);
        let processedData = imageData;

        // ✅ Näytetään esikäsitelty kuva käyttöliittymässä
        processedCanvas.width = processedData.width;
        processedCanvas.height = processedData.height;
        processedCtx.putImageData(processedData, 0, 0);

        let imageUrl = processedCanvas.toDataURL("image/png");
        recognizeText(imageUrl);
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
                tessedit_char_whitelist: "0123456789" // Estetään turhat merkit
            }
        ).then(({ data: { text } }) => {
            let cleanedText = extractValidID(text);
            if (cleanedText) {
                result.innerText = "Luettu ID: " + cleanedText;
                saveID(cleanedText);
            } else {
                result.innerText = "Ei löytynyt kelvollista ID:tä.";
            }
        }).catch(error => {
            console.error("OCR epäonnistui", error);
            result.innerText = "Virhe OCR-käsittelyssä!";
        }).finally(() => {
            // ✅ Poistetaan animaatio napilta ja palautetaan normaali teksti
            scanButton.classList.remove("loading");
            scanButton.innerHTML = '<i class="material-icons">camera</i> Skannaa ID';
            scanButton.disabled = false;
        });
    }

    function extractValidID(text) {
        // 🧹 Puhdistetaan OCR-tulokset (poistetaan välilyönnit ja muut roskat)
        // let cleanedText = text.replace(/\s+/g, "").trim();
        let cleanedText = text.trim();

        // 🔍 Etsitään kelvollinen 16-numeroinen ID
        let match = cleanedText.match(/(\d{16})/);
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
        idList.innerHTML = ""; // Tyhjennetään lista ennen päivitystä
        let ids = JSON.parse(localStorage.getItem("savedIDs")) || [];

        ids.forEach(id => {
            let li = document.createElement("li");
            li.classList.add("new"); // Lisää animaatio uuden lisäyksen yhteydessä

            // ✅ ID:n näyttäminen korttimaisena, mukana FontAwesome-ikoni
            li.innerHTML = `
                <span class="id-icon material-icons">confirmation_number</span> ${id}
            `;

            idList.appendChild(li);
        });
    }
    
    startCamera();
    renderIDList();
});
