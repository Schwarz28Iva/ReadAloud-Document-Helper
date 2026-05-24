// Set event handlers for each set of elements corresponding to each functionality
["enchant", "sorcerer"].forEach((lateralId) => {
    const dropZone = document.getElementById(`drop_zone_${lateralId}`);
    const fileInput = document.getElementById(`fileInput_${lateralId}`);
    const fileDetails = document.getElementById(`fileDetails_${lateralId}`);
    const processButton = lateralId === "enchant"
        ? document.getElementById("processBtn_enchant")
        : document.getElementById("processBtn_sorcerer_file");
    const removeBtn = document.getElementById(`removeBtn_${lateralId}`);
    const fileName = document.getElementById(`fileName_${lateralId}`);
    const fileIcon = dropZone.querySelector("i");
    const selectButton = dropZone.querySelector("button");
    const dropText = dropZone.querySelector("p");
    const ocrResult = document.getElementById("ocrResult");
    const audioPlayer = document.querySelector(".audio-wrapper");

    dropZone.addEventListener("dragover", function (event) {
        event.preventDefault();
        this.classList.add("hover");
    });

    dropZone.addEventListener("drop", function (event) {
        event.preventDefault();
        this.classList.remove("hover");
        const file = event.dataTransfer.files[0];
        if (file) {
            fileInput.files = event.dataTransfer.files;
            handleFileUpload(file, fileDetails, fileName, fileIcon, processButton, selectButton, dropText);
        }
    });

    dropZone.addEventListener("dragleave", function (event) {
        event.preventDefault();
        this.classList.remove("hover");
    });

    fileInput.addEventListener("change", function (event) {
        const file = event.target.files[0];
        if (file) {
            handleFileUpload(file, fileDetails, fileName, fileIcon, processButton, selectButton, dropText);
        }
    });

    removeBtn.addEventListener("click", function () {
        fileInput.value = "";
        fileDetails.style.display = "none";
        processButton.style.display = "none";
        fileIcon.classList.remove("fa-check");
        fileIcon.classList.add("fa-file-alt");
        selectButton.style.display = "inline-block";
        dropText.style.display = "block";
        ocrResult.style.display = "none";
        audioPlayer.style.display = "none";
    });
});

function handleFileUpload(file, fileDetailsDiv, fileNameSpan, fileIcon, processButton, selectButton, dropText) {
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
        alert("Please select a PDF file.");
        return;
    }

    fileDetailsDiv.style.display = "flex";
    fileNameSpan.textContent = file.name;
    processButton.style.display = "block";
    fileIcon.classList.remove("fa-file-alt");
    fileIcon.classList.add("fa-check");
    selectButton.style.display = "none";
    dropText.style.display = "none";
}

function copyText() {
    const text = document.getElementById("recognizedText").innerText;
    navigator.clipboard.writeText(text).then(() => {
        alert("Text copied to clipboard!");
    });
}
