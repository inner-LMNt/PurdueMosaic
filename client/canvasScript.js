// script.js

let currentColor = "#000000"; // Default color

// Function to create a single pixel element
function createPixel() {
    const pixel = document.createElement("div");
    pixel.className = "pixel";

    // Add click event to change the pixel color
    pixel.addEventListener("click", () => {
        const newColor = getColor(); // Get the selected color
        pixel.style.backgroundColor = newColor; // Set the selected color
    });

    return pixel;
}

// Function to set the current color
function setCurrentColor(color) {
    currentColor = color;
    const colorPresets = document.querySelectorAll(".color-preset");

    // Remove the "selected" class from all presets and reset border colors
    colorPresets.forEach(preset => {
        preset.classList.remove("selected");
        preset.style.borderColor = "black"; // Reset border color to black for all presets
    });

    // Find the selected preset by data-color attribute and add the "selected" class
    const selectedPreset = document.querySelector(`[data-color="${color}"]`);
    if (selectedPreset) {
        selectedPreset.classList.add("selected");
        selectedPreset.style.borderColor = darkenColor(color); // Apply darker border color
    }

    // Update the custom color button to reflect the selected color
    const customColorButton = document.getElementById("color-picker");
    customColorButton.value = color;
}

// Function to darken a given color
function darkenColor(color) {
    // Parse the color into its RGB components
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);

    // Darken the color by reducing each component by 40%
    const darkenedR = Math.max(0, r - Math.round(r * 0.4));
    const darkenedG = Math.max(0, g - Math.round(g * 0.4));
    const darkenedB = Math.max(0, b - Math.round(b * 0.4));

    // Convert the darkened components back to a HEX color
    return `#${darkenedR.toString(16).padStart(2, "0")}${darkenedG.toString(16).padStart(2, "0")}${darkenedB.toString(16).padStart(2, "0")}`;
}

// Function to get the selected color from the color wheel
function getColor() {
    const colorPicker = document.getElementById("color-picker");
    return colorPicker.value;
}

function createGrid() {
    const canvasContainer = document.querySelector(".canvas-container");

    for (let i = 0; i < 30 * 50; i++) {
        const pixel = createPixel();
        pixel.style.backgroundColor = "#fff"; // Set the initial background color to white
        pixel.style.width = "20px"; // Set the pixel size
        pixel.style.height = "20px"; // Set the pixel size
        canvasContainer.appendChild(pixel);
    }
}


// Call the function to create the grid when the page loads
window.addEventListener("load", createGrid);

// Event listeners for preset color circles
const colorPresets = document.querySelectorAll(".color-preset");

colorPresets.forEach(preset => {
    const color = preset.getAttribute("data-color");
    
    // Add click event to set the current color when a preset is clicked
    preset.addEventListener("click", () => {
        setCurrentColor(color);
    });

    // Initialize the current color based on the default color
    if (color === currentColor) {
        preset.classList.add("selected");
    }
});

// Initialize the color picker to the default color
const colorPicker = document.getElementById("color-picker");
colorPicker.value = currentColor;
colorPicker.addEventListener("input", () => {
    const color = getColor();
    setCurrentColor(color);
});

// Function to update the current prompt
function updateCurrentPrompt(prompt) {
    const currentPromptElement = document.getElementById("current-prompt");
    currentPromptElement.textContent = prompt;
}

// Example usage:
const initialPrompt = "Initial Prompt";
updateCurrentPrompt(initialPrompt);

// Function to capture canvas content and trigger download
function downloadCanvas() {

    // Create a temporary canvas with the content of the grid
    const tempCanvas = createTempCanvas();
    
    if (tempCanvas === null) {
        console.error('Failed to create a temporary canvas.'); // Log an error if the temporary canvas creation failed
        return;
    }

    const dataURL = tempCanvas.toDataURL('image/png');

    // Create a download link
    const downloadLink = document.createElement('a');
    downloadLink.href = dataURL;
    downloadLink.download = 'canvas.png'; // Set the default download filename

    // Trigger a click event on the download link to start the download
    downloadLink.click();
}

function createTempCanvas() {
    const canvasContainer = document.querySelector('.canvas-container');
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = 50 * 20; // Width of the canvas in pixels
    tempCanvas.height = 30 * 20; // Height of the canvas in pixels
    const context = tempCanvas.getContext('2d');

    const pixels = canvasContainer.querySelectorAll('.pixel');

    if (pixels.length === 0) {
        console.error('No pixels found in the grid.');
        return null;
    }

    // Loop through all the pixels and draw them onto the temporary canvas
    pixels.forEach((pixel, index) => {
        const x = (index % 50) * 20; // Adjust for pixel size
        const y = Math.floor(index / 50) * 20; // Adjust for pixel size

        // Retrieve the pixel's background color
        const pixelColor = window.getComputedStyle(pixel).backgroundColor;

        // Set the fill color to the pixel's background color
        context.fillStyle = pixelColor;

        // Draw a rectangle representing the pixel
        context.fillRect(x, y, 20, 20); // Adjust for pixel size
    });

    return tempCanvas;
}

// Function to export the temporary canvas as a PNG image
function exportCanvasAsPNG() {
    const tempCanvas = createTempCanvas();
    const dataURL = tempCanvas.toDataURL('image/png');

    // Create a download link
    const downloadLink = document.createElement('a');
    downloadLink.href = dataURL;
    downloadLink.download = 'canvas.png'; // Set the default download filename

    // Trigger a click event on the download link to start the download
    downloadLink.click();
}


function clearCanvas() { //will clear canvas when called
    const pixels = document.querySelectorAll('.pixel');
            pixels.forEach(pixel => {
                pixel.style.backgroundColor = "#fff"; // clears pixel background color
            });
}

// Add a click event listener to the download button
const downloadButton = document.getElementById('download-button');
downloadButton.addEventListener('click', downloadCanvas);