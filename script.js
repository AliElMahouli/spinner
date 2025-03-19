const canvas = document.getElementById("wheelCanvas");
const ctx = canvas.getContext("2d");
const centerX = canvas.width / 2;
const centerY = canvas.height / 2;
const radius = 200;
const biasSlider = document.getElementById("biasSlider");
const spinButton = document.getElementById("spinButton");

// Define possible results
let result1 = "Mi";
let result2 = "Bun";
const images = ["Mi.png", "Bun.png"];

const loadedImages = [];
let angle = 0;
let spinning = false;
let speed = 0;
const deceleration = 0.98;

const winnerPopup = document.getElementById("winnerPopup");
const winnerMessage = document.getElementById("winnerMessage");
const winnerImage = document.getElementById("winnerImage");

winnerPopup.style.display = "none";

// Load images before drawing the wheel
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

// Calculate slice angles based on the slider position
function getSliceAngles() {
    let biasValue = parseFloat(biasSlider.value);
    let percentage = (biasValue + 1) / 2; // Convert -1 to 1 range into 0 to 1
    let angle1 = percentage * (2 * Math.PI - 0.2) + 0.1; // Avoid 0-degree slices
    let angle2 = 2 * Math.PI - angle1;
    return [angle1, angle2];
}

// Draw the wheel with variable slice sizes
function drawWheel(rotation = 0) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(rotation);

    const sliceAngles = getSliceAngles();
    let currentAngle = 0;

    for (let i = 0; i < images.length; i++) {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, radius, currentAngle, currentAngle + sliceAngles[i]);
        ctx.closePath();
        ctx.fillStyle = i % 2 === 0 ? "#FFD700" : "#FF6347";
        ctx.fill();
        ctx.stroke();

        const angleSlice = currentAngle + sliceAngles[i] / 2;
        const sliceSizeFactor = sliceAngles[i] / (2 * Math.PI);
        const imgSize = 80 + sliceSizeFactor * 120; // Dynamic scaling

        const imgX = Math.cos(angleSlice) * radius * 0.6 - imgSize / 2;
        const imgY = Math.sin(angleSlice) * radius * 0.6 - imgSize / 2;
        if (loadedImages[i]) {
            ctx.drawImage(loadedImages[i], imgX, imgY, imgSize, imgSize);
        }
        currentAngle += sliceAngles[i];
    }

    ctx.restore();
}

// Draw the red needle at the top
function drawNeedle() {
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - radius - 20);
    ctx.lineTo(centerX - 10, centerY - radius - 40);
    ctx.lineTo(centerX + 10, centerY - radius - 40);
    ctx.closePath();
    ctx.fillStyle = "red";
    ctx.fill();
}

// Start spinning the wheel
function spinWheel() {
    if (spinning) return;

    winnerPopup.style.display = "none";
    spinning = true;
    speed = Math.random() * 10 + 15;

    const sliceAngles = getSliceAngles();

    // Calculate the stopping position based on slice sizes
    let randomStopAngle = Math.random() * (2 * Math.PI);
    let accumulatedAngle = 0;
    let winningIndex = 0;

    for (let i = 0; i < images.length; i++) {
        accumulatedAngle += sliceAngles[i];
        if (randomStopAngle < accumulatedAngle) {
            winningIndex = i;
            break;
        }
    }

    let totalSpins = Math.floor(Math.random() * 5 + 5); // 5 to 10 full spins
    let finalStopAngle = totalSpins * (2 * Math.PI) + randomStopAngle;

    function animate() {
        if (speed > 0.1) {
            angle += speed * (Math.PI / 180);
            speed *= deceleration;
            drawWheel(angle);
            drawNeedle();
            requestAnimationFrame(animate);
        } else {
            spinning = false;
            angle = finalStopAngle % (2 * Math.PI);
            declareWinner(winningIndex);
        }
    }

    animate();
}

// Show the winner in a popup
function declareWinner(winningIndex) {
    let winner = winningIndex === 0 ? result1 : result2;

    winnerMessage.textContent = "Winner: " + winner;
    winnerImage.src = images[winningIndex]; // Show winner image

    setTimeout(() => {
        winnerPopup.style.display = "flex";
    }, 500);
}

// Close popup on click
winnerPopup.addEventListener("click", () => {
    winnerPopup.style.display = "none";
});

// Update the wheel live when the slider moves
biasSlider.addEventListener("input", () => drawWheel(angle));

// Start drawing once images are loaded
spinButton.addEventListener("click", spinWheel);
loadImages(() => drawWheel(angle));
