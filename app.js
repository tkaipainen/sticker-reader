document.addEventListener("DOMContentLoaded", () => {
    const video = document.getElementById("video");
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");
    const scanButton = document.getElementById("scanButton");
    const result = document.getElementById("result");
    const idList = document.getElementById("idList");

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
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        let imageData = canvas.toDataURL("image/png");

        recognizeText(imageData);
    }

    // 🔍 Käytä OCR:ää tekstin tunnistamiseen
    function recognizeText(imageData) {
        result.innerText = "Tunnistetaan ID:tä...";
        Tesseract.recognize(
            imageData,
            "eng", // Voit lisätä muita kieliä (esim. "fin" suomi)
            {
                logger: m => console.log(m)
            }
        ).then(({ data: { text } }) => {
            let cleanedText = text.replace(/\s+/g, "").trim(); // Poistetaan tyhjät merkit
            result.innerText = "Luettu ID: " + cleanedText;
            if (cleanedText) saveID(cleanedText);
        }).catch(error => {
            console.error("OCR epäonnistui", error);
            result.innerText = "Virhe OCR-käsittelyssä!";
        });
    }

    // 💾 Tallenna ID localStorageen
    function saveID(id) {
        let ids = JSON.parse(localStorage.getItem("savedIDs")) || [];
        ids.push(id);
        localStorage.setItem("savedIDs", JSON.stringify(ids));
        renderIDList();
    }

    // 📜 Näytä tallennetut ID:t
    function renderIDList() {
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
