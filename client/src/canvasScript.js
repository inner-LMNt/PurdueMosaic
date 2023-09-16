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

    // Remove the "selected" class from all presets
    colorPresets.forEach(preset => {
        preset.classList.remove("selected");
    });

    // Find the selected preset by data-color attribute and add the "selected" class
    const selectedPreset = document.querySelector(`[data-color="${color}"]`);
    if (selectedPreset) {
        selectedPreset.classList.add("selected");
    }

    // Update the custom color button to reflect the selected color
    const customColorButton = document.getElementById("color-picker");
    customColorButton.value = color;
}

// Function to get the selected color from the color wheel
function getColor() {
    const colorPicker = document.getElementById("color-picker");
    return colorPicker.value;
}

// Function to create the grid and add it to the canvas container
function createGrid() {
    const canvasContainer = document.querySelector(".canvas-container");

    for (let i = 0; i < 30 * 30; i++) {
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
