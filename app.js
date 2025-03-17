document.addEventListener("DOMContentLoaded", () => {
    const video = document.getElementById("video");
    const scanButton = document.getElementById("scanButton");
    const result = document.getElementById("result");
    const idList = document.getElementById("idList");

    // 📸 Pyydä käyttöoikeus kameraan ja näytä se videossa
    async function startCamera() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
            video.srcObject = stream;
        } catch (error) {
            console.error("Kameran käyttö estetty", error);
            alert("Ei pääsyä kameraan!");
        }
    }

    // 🔍 Simuloi ID:n lukemista (QR-koodin skannauksen voi lisätä myöhemmin)
    scanButton.addEventListener("click", () => {
        let fakeID = "ID-" + Math.floor(Math.random() * 100000);
        result.innerText = "Luettu ID: " + fakeID;
        saveID(fakeID);
    });

    // 💾 Tallenna ID IndexedDB:hen
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
