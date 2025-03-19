const canvas = document.getElementById("wheelCanvas");
const ctx = canvas.getContext("2d");
const centerX = canvas.width / 2;
const centerY = canvas.height / 2;
const radius = 200;
const numSlices = 2;
const images = ["Mi.jpg", "Bun.jpg"];
const sliceAngle = (2 * Math.PI) / numSlices;

const loadedImages = [];
let angle = 0;
let spinning = false;
let speed = 0;

// Popup elements
const winnerPopup = document.getElementById("winnerPopup");
const popupContent = document.getElementById("popupContent");
const winnerMessage = document.getElementById("winnerMessage");
const winnerImage = document.getElementById("winnerImage");

winnerPopup.style.display = "none";

// Load images for slices
function loadImages(callback) {
    let count = 0;
    images.forEach((src, i) => {
        const img = new Image();
        img.src = src;
        img.onload = () => {
            loadedImages[i] = img;
            count++;
            if (count === images.length) callback();
        };
        img.onerror = () => console.error(`Error loading image: ${src}`);
    });
}

function drawWheel(rotation = 0) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(rotation);

    for (let i = 0; i < numSlices; i++) {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, radius, i * sliceAngle, (i + 1) * sliceAngle);
        ctx.closePath();
        ctx.fillStyle = i % 2 === 0 ? "#FFD700" : "#FF6347";
        ctx.fill();
        ctx.stroke();

        // Position images in the middle of each slice
        const angleSlice = i * sliceAngle + sliceAngle / 2;
        const imgX = Math.cos(angleSlice) * radius * 0.6 - 30;
        const imgY = Math.sin(angleSlice) * radius * 0.6 - 30;
        if (loadedImages[i]) {
            ctx.drawImage(loadedImages[i], imgX, imgY, 60, 60);
        }
    }

    ctx.restore();
    drawNeedle();
}

function drawNeedle() {
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - radius - 20);
    ctx.lineTo(centerX - 10, centerY - radius - 40);
    ctx.lineTo(centerX + 10, centerY - radius - 40);
    ctx.closePath();
    ctx.fillStyle = "red";
    ctx.fill();
}

function spinWheel() {
    if (spinning) return;

    winnerPopup.style.display = "none"; // Hide popup before spinning
    spinning = true;
    speed = Math.random() * 10 + 15;
    let deceleration = 0.98;

    function animate() {
        if (speed > 0.1) {
            angle += speed * (Math.PI / 180);
            speed *= deceleration;
            drawWheel(angle);
            requestAnimationFrame(animate);
        } else {
            spinning = false;
            angle %= (2 * Math.PI);
            declareWinner();
        }
    }

    animate();
}

function declareWinner() {
    let finalAngle = (2 * Math.PI - angle) % (2 * Math.PI);
    let winningIndex = Math.floor(finalAngle / sliceAngle) % numSlices;
    let winner = images[winningIndex];

    // Show popup with winner
    winnerMessage.textContent = "Winner: " + winner;
    winnerImage.src = winner;
    winnerPopup.style.display = "flex";
}

// Close popup when clicking anywhere
winnerPopup.addEventListener("click", () => {
    winnerPopup.style.display = "none";
});

document.getElementById("spinButton").addEventListener("click", spinWheel);
loadImages(() => drawWheel(angle));
