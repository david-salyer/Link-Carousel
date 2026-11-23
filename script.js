let links = [];
let currentIndex = 0;
let currentFilename = 'links.txt';
let globalHeaderTitle = '';

const uploadScreen = document.getElementById("upload-screen");
const carouselScreen = document.getElementById("carousel-screen");
const trackTop = document.getElementById("track-top");
const trackBottom = document.getElementById("track-bottom");
const counterLeft = document.getElementById("counter-left");
const counterCenter = document.getElementById("counter-center");
const counterRight = document.getElementById("counter-right");
const reuploadBtn = document.getElementById("reupload-btn");
const downloadBtn = document.getElementById("download-btn");

const titleElement = document.getElementById("link-title");
const firstButton = document.getElementById("first-btn");
const prevButton = document.getElementById("prev-btn");
const nextButton = document.getElementById("next-btn");
const lastButton = document.getElementById("last-btn");
const openButton = document.getElementById("open-btn");
        
const leftText = document.getElementById("left-text");
const rightText = document.getElementById("right-text");
const progressTop = document.getElementById("progress-top");
const progressBottom = document.getElementById("progress-bottom");
const congrats = document.getElementById("congrats");

function togglePasteArea() {
    const pasteContainer = document.getElementById('paste-container');
    if (pasteContainer.style.display === 'flex') {
        pasteContainer.style.display = 'none';
    } else {
        pasteContainer.style.display = 'flex';
    }
}

function handlePasteSubmit() {
    const text = document.getElementById('paste-textarea').value;
    if (!text.trim()) {
        alert('Please paste some text first.');
        return;
    }
    currentFilename = 'links.txt';
    parseLinkText(text);
}

// Drag and drop handlers
window.addEventListener('dragover', (e) => {
    e.preventDefault();
    document.body.classList.add('drag-over');
});

window.addEventListener('dragleave', (e) => {
    e.preventDefault();
    document.body.classList.remove('drag-over');
});

window.addEventListener('drop', (e) => {
    e.preventDefault();
    document.body.classList.remove('drag-over');
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0];
        if (file.name.endsWith('.txt') || file.type === 'text/plain') {
            processFile(file);
        } else {
            alert('Please upload a valid .txt file.');
        }
    }
});

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        processFile(file);
    }
    event.target.value = ''; // Reset input
}

function triggerReupload() {
    document.getElementById('reupload-input').click();
}

function processFile(file) {
    if (file.name) {
        currentFilename = file.name;
    }
    const reader = new FileReader();
    reader.onload = function(e) {
        parseLinkText(e.target.result);
    };
    reader.readAsText(file);
}

function getDomain(url) {
    try {
        const parsed = new URL(url);
        return parsed.hostname.replace(/^www\./, '');
    } catch (e) {
        return url;
    }
}

function parseLinkText(text) {
    const lines = text.split(/\r?\n/);
    const parsedLinks = [];
            
    globalHeaderTitle = '';
    let currentTitleLines = [];

    for (let i = 0; i < lines.length; i++) {
        let rawLine = lines[i];
        let line = rawLine.trim();
                
        if (!line) {
            if (currentTitleLines.length > 0 && parsedLinks.length === 0 && !globalHeaderTitle) {
                globalHeaderTitle = currentTitleLines.join('\n').replace(/\\n/g, '\n').trim();
            }
            currentTitleLines = [];
            continue;
        }

        if (line.startsWith('http://') || line.startsWith('https://')) {
            let opened = false;
            let title = "";
            let rawTitleText = currentTitleLines.join('\n').replace(/\\n/g, '\n').trim();

            if (rawTitleText.toUpperCase() === "X") {
                opened = true;
                title = getDomain(line);
            } else if (rawTitleText.toUpperCase().startsWith("X ")) {
                opened = true;
                title = rawTitleText.substring(2).trim();
                if (!title) title = getDomain(line);
            } else if (currentTitleLines.length === 0 && parsedLinks.length === 0 && !globalHeaderTitle) {
                title = getDomain(line);
            } else if (currentTitleLines.length === 0) {
                title = getDomain(line);
            } else {
                if (rawTitleText.startsWith('X ')) {
                    rawTitleText = rawTitleText.substring(2);
                    opened = true;
                } else if (rawTitleText.endsWith(' X')) {
                    rawTitleText = rawTitleText.substring(0, rawTitleText.length - 2);
                    opened = true;
                }
                title = rawTitleText.trim();
            }

            parsedLinks.push({
                title: title,
                url: line,
                opened: opened
            });

            currentTitleLines = [];
        } 
        else if (line.toUpperCase().startsWith("X HTTP://") || line.toUpperCase().startsWith("X HTTPS://") || line.toUpperCase().startsWith("XHTTP://") || line.toUpperCase().startsWith("XHTTPS://")) {
            let urlPart = line.substring(1).trim();
            let title = currentTitleLines.length > 0 ? currentTitleLines.join('\n').replace(/\\n/g, '\n').trim() : getDomain(urlPart);
                    
            parsedLinks.push({
                title: title,
                url: urlPart,
                opened: true
            });
            currentTitleLines = [];
        }
        else {
            currentTitleLines.push(rawLine);
        }
    }

    if (parsedLinks.length === 0) {
        alert('No valid links found in the text/file.');
        return;
    }

    links = parsedLinks;
            
    const firstFalseIndex = links.findIndex(link => !link.opened);
    if (firstFalseIndex !== -1) {
        currentIndex = firstFalseIndex;
    } else if (links.length > 0 && links.every(link => link.opened)) {
        currentIndex = links.length - 1;
    } else {
        currentIndex = 0;
    }

    uploadScreen.style.display = 'none';
    carouselScreen.style.display = 'block';
    trackTop.style.display = 'block';
    trackBottom.style.display = 'block';
    counterLeft.style.display = 'block';
    counterCenter.style.display = 'block';
    counterRight.style.display = 'block';
    reuploadBtn.style.display = 'block';
    downloadBtn.style.display = 'block';

    updateView();
}

function updateView() {
    if (links.length === 0) return;

    if (currentIndex >= links.length) {
        currentIndex = Math.max(0, links.length - 1);
    }

    const currentLink = links[currentIndex];
    titleElement.textContent = currentLink.title;

    // Update browser tab title: use global header title if present, otherwise fallback to "filename.txt (Link Carousel)"
    document.title = globalHeaderTitle ? globalHeaderTitle : `${currentFilename} (Link Carousel)`;

    firstButton.disabled = currentIndex === 0 || links.length === 0;
    prevButton.disabled = currentIndex === 0 || links.length === 0;
    nextButton.disabled = currentIndex >= links.length - 1;
    lastButton.disabled = currentIndex >= links.length - 1;

    if (links.length > 0 && currentLink.opened) {
        openButton.classList.add("greyed");
    } else {
        openButton.classList.remove("greyed");
    }

    const totalLinks = links.length;
    const currentSlideNum = totalLinks > 0 ? currentIndex + 1 : 0;
    leftText.textContent = `${currentSlideNum}/${totalLinks}`;
            
    let bottomPercent = 0;
    if (totalLinks > 1) {
        bottomPercent = (currentIndex / (totalLinks - 1)) * 100;
    } else if (totalLinks === 1) {
        bottomPercent = 100;
    }
    progressBottom.style.width = `${bottomPercent}%`;

    const openedCount = links.filter(link => link.opened).length;
    const rawPercentage = totalLinks > 0 ? (openedCount / totalLinks) * 100 : 0;
    const roundedPercentage = Math.ceil(rawPercentage);
            
    rightText.textContent = `${roundedPercentage}%`;
    progressTop.style.width = `${roundedPercentage}%`;
            
    if (roundedPercentage === 100) {
        congrats.style.display = "inline-block";
    } else {
        congrats.style.display = "";
    }
}

function changeSlide(direction) {
    if (links.length === 0) return;
    currentIndex += direction;
    if (currentIndex < 0) currentIndex = 0;
    else if (currentIndex >= links.length) currentIndex = links.length - 1;
    updateView();
}

function firstSlide() {
    if (links.length === 0) return;
    currentIndex = 0;
    updateView();
}

function lastSlide() {
    if (links.length === 0) return;
    currentIndex = links.length - 1;
    updateView();
}

function openLink() {
    if (links.length === 0) return;
    links[currentIndex].opened = true;
    window.open(links[currentIndex].url, '_blank');
    updateView();
}

function markAsUnseen() {
    if (links.length === 0) return;
    links[currentIndex].opened = false;
    updateView();
}

function getCurrentUrlToCopy() {
    if (!Array.isArray(links) || links.length === 0) {
        return '';
    }
    const safeIndex = Math.min(Math.max(currentIndex, 0), links.length - 1);
    return links[safeIndex]?.url ?? '';
}

let hideAlertTimeout;
let hideAlertFrame;

function showCopyAlert() {
    const alertEl = document.getElementById('copy-alert');
    if (!alertEl) return;

    clearTimeout(hideAlertTimeout);
    cancelAnimationFrame(hideAlertFrame);

    // Force an instant snap to visible if already mid-fade
    alertEl.classList.remove('is-visible');
    void alertEl.offsetWidth;
    alertEl.classList.add('is-visible');

    hideAlertTimeout = setTimeout(() => {
        hideAlertFrame = requestAnimationFrame(() => {
            alertEl.classList.remove('is-visible');
        });
    }, 750);
}

if (openButton) {
    openButton.addEventListener('contextmenu', async (event) => {
        if (openButton.disabled) return;

        const urlToCopy = getCurrentUrlToCopy();
        if (!urlToCopy) return;

        event.preventDefault();
        showCopyAlert();

        try {
            await navigator.clipboard.writeText(urlToCopy);
        } catch (err) {
            console.error('Clipboard copy failed:', err);
        }
    });
}

function resetToInitialState() {
    links = [];
    currentIndex = 0;
    currentFilename = 'links.txt';
    globalHeaderTitle = '';
    document.title = 'Link Carousel';

    const fileInput = document.getElementById('file-input');
    if (fileInput) fileInput.value = '';

    const reuploadInput = document.getElementById('reupload-input');
    if (reuploadInput) reuploadInput.value = '';

    const pasteTextarea = document.getElementById('paste-textarea');
    if (pasteTextarea) pasteTextarea.value = '';

    const pasteContainer = document.getElementById('paste-container');
    if (pasteContainer) pasteContainer.style.display = 'none';

    titleElement.textContent = '';
    leftText.textContent = '0/0';
    rightText.textContent = '0%';
    progressTop.style.width = '0%';
    progressBottom.style.width = '0%';
    congrats.style.display = '';

    openButton.classList.remove('greyed');
    firstButton.disabled = true;
    prevButton.disabled = true;
    nextButton.disabled = true;
    lastButton.disabled = true;

    carouselScreen.style.display = 'none';
    trackTop.style.display = 'none';
    trackBottom.style.display = 'none';
    counterLeft.style.display = 'none';
    counterCenter.style.display = 'none';
    counterRight.style.display = 'none';
    reuploadBtn.style.display = 'none';
    downloadBtn.style.display = 'none';
    uploadScreen.style.display = 'block';
}

function removeSlide() {
    if (links.length === 0) return;

    if (links.length === 1) {
        resetToInitialState();
        return;
    }

    links.splice(currentIndex, 1);

    if (currentIndex >= links.length) {
        currentIndex = links.length - 1;
    }

    updateView();
}

function downloadProgress() {
    if (links.length === 0) return;

    let fileContent = "";
    if (globalHeaderTitle) {
        fileContent += globalHeaderTitle + "\n\n";
    }

    links.forEach((link, idx) => {
        let formattedTitle = link.title;
        if (link.opened) {
            formattedTitle = "X " + formattedTitle;
        }
        fileContent += formattedTitle + "\n" + link.url;
        if (idx < links.length - 1) {
            fileContent += "\n\n";
        }
    });

    const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = currentFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
        
window.addEventListener("keydown", (event) => {
    if (event.defaultPrevented || links.length === 0) { return; }

    switch (event.code) {
        case "ArrowUp":
            firstSlide();
            break;
        case "ArrowDown":
            lastSlide();
            break;
        case "ArrowLeft":
            changeSlide(-1);
            break;
        case "ArrowRight":
            changeSlide(1);
            break;
        case "Enter":
        case "Space":
            openLink();
            break;
        default:
            return;
    }

    event.preventDefault();
});