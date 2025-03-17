document.addEventListener("DOMContentLoaded", () => {
    const video = document.getElementById("video");
    const scanButton = document.getElementById("scanButton");
    const result = document.getElementById("result");
    const idList = document.getElementById("idList");

    async function startCamera() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "environment" }
            });
            video.srcObject = stream;
            video.onloadedmetadata = () => video.play();
        } catch (error) {
            console.error("Kameran käyttö estetty:", error);
            alert("Ei pääsyä kameraan! Tarkista oikeudet.");
        }
    }

    scanButton.addEventListener("click", () => {
        captureFrame();
    });

    function captureFrame() {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        let imageUrl = canvas.toDataURL("image/png");
        recognizeText(imageUrl);
    }

    function recognizeText(imageData) {
        result.innerText = "Tunnistetaan ID:tä...";

        Tesseract.recognize(
            imageData,
            "eng",
            {
                logger: m => console.log(m),
                tessedit_char_whitelist: "SIN0123456789"
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
        let cleanedText = text.replace(/\s+/g, "").trim();
        let match = cleanedText.match(/(?:SIN)?(\d{16})/);
        return match ? match[0] : null;
    }

    function saveID(id) {
        db.collection("ids").add({
            id: id,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        }).then(() => {
            console.log("ID tallennettu:", id);
            renderIDList();
        }).catch(error => {
            console.error("Virhe tallennuksessa:", error);
        });
    }

    function renderIDList() {
        idList.innerHTML = "";
        db.collection("ids").orderBy("timestamp", "desc").get().then(snapshot => {
            snapshot.forEach(doc => {
                let li = document.createElement("li");
                li.textContent = doc.data().id;
                idList.appendChild(li);
            });
        });
    }

    startCamera();
    renderIDList();
});
