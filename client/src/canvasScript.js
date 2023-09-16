// script.js

let currentColor = "#000000"; // Default color

// Function to create a single pixel element
function createPixel() {
    const pixel = document.createElement("div");
    pixel.className = "pixel";

    // Add click event to change the pixel color
    pixel.addEventListener("click", () => {
        pixel.style.backgroundColor = currentColor; // Set the selected color
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

// Function to create the grid and add it to the canvas container
function createGrid() {
    const canvasContainer = document.querySelector(".canvas-container");

    for (let i = 0; i < 30 * 50; i++) {
        const pixel = createPixel();
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
    const canvasContainer = document.querySelector('.canvas-container');

    // Create a temporary canvas element
    const tempCanvas = document.createElement('canvas');
    const context = tempCanvas.getContext('2d');

    // Set the dimensions of the temporary canvas to match the canvas container
    tempCanvas.width = canvasContainer.offsetWidth;
    tempCanvas.height = canvasContainer.offsetHeight;

    // Draw the content of the canvas container onto the temporary canvas
    context.drawImage(canvasContainer, 0, 0);

    // Convert the canvas content to a data URL (PNG format)
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