// canvasScript.js
document.addEventListener('DOMContentLoaded', () => {
    var socket = io();

    socket.on('userCount', (count) => {
        const userCountElement = document.getElementById('user-count')
        userCountElement.innerHTML = "Active Users: " + String(Math.ceil(count/2));
    })
    // Listen for the 'initialPixels' event to get the initial pixel data from the server
    socket.on('initialPixels', (initialPixels) => {
      // Update the pixel colors based on the initial data from the server
      const pixels = document.querySelectorAll('.pixel');
      pixels.forEach((pixel, index) => {
        pixel.style.backgroundColor = initialPixels[index];
      });
    });
  
    // Listen for the 'updatePixel' event to receive real-time updates from other clients
    socket.on('updatePixel', (data) => {
      // Update the pixel color in real-time
      const pixels = document.querySelectorAll('.pixel');
      pixels[data.index].style.backgroundColor = data.color;
    });

    socket.on('timerZeroReached', () => {
        clearCanvas();
        console.log('Grid reset.');
    });
  
    let currentColor = '#000000'; // Default color

    function rgbToHex(rgb) {
        // Split the RGB string into individual values
        const rgbArray = rgb.match(/\d+/g);
    
        if (rgbArray) {
            // Convert each value to a hexadecimal string and join them
            return "#" + rgbArray.map(value => {
                const hex = parseInt(value, 10).toString(16); // Convert to base 16 (hex)
                return hex.length === 1 ? "0" + hex : hex; // Ensure two digits
            }).join("");
        }
    
        return "#000000"; // Default to black if no valid RGB value
    }
  
    // Function to create a single pixel element
    function createPixel() {
      const pixel = document.createElement('div');
      pixel.className = 'pixel';
  
      // Add click event to change the pixel color
      pixel.addEventListener('click', () => {
        const color = currentColor;
        const index = Array.from(pixel.parentNode.children).indexOf(pixel);
        if (!isEyedropperActive) {
            pixel.style.backgroundColor = color; // Set the selected color
        // Send the pixel update to the server
        socket.emit('updatePixel', { index, color });
        console.log('Emitted initial pixels to a user');
        }
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
        updateColorPickerValue();
    }

    // Get the eyedropper button image element
    const eyedropperButton = document.getElementById('eyedropper-button');

    let isEyedropperActive = false; // Flag to track eyedropper activation

    // Function to toggle the eyedropper tool
    function toggleEyedropper() {
        isEyedropperActive = !isEyedropperActive; // Toggle the flag
    
        // Deselect other options and collapse if needed
        const colorPresets = document.querySelectorAll(".color-preset");
        colorPresets.forEach(preset => {
            preset.classList.remove("selected");
            preset.style.width = "30px"; // Reset width
            preset.style.height = "30px"; // Reset height
        });
    
        if (isEyedropperActive) {
            // If the eyedropper tool is activated
            eyedropperButton.classList.add('active'); // Add a CSS class to darken the button
            addEyedropperEventListeners(); // Enable the click event listeners on pixels
        } else {
            // If the eyedropper tool is deactivated
            eyedropperButton.classList.remove('active'); // Remove the CSS class to restore the button
            removeEyedropperEventListeners(); // Remove the click event listeners on pixels
        }
    }

    function addEyedropperEventListeners() {
        const pixels = document.querySelectorAll('.pixel');
        pixels.forEach(pixel => {
            pixel.addEventListener('click', () => {
                if (isEyedropperActive) {
                    const pixelColor = window.getComputedStyle(pixel).backgroundColor;
                    currentColor = pixelColor; // Store the selected color
                    document.getElementById("color-picker").value = currentColor; // Update color picker
                    console.log(`Selected color: ${currentColor}`);
                    updateColorPickerValueRGB();
                } else {
                    // If the eyedropper is not active, allow canvas editing as usual
                    const color = currentColor;
                    const index = Array.from(pixel.parentNode.children).indexOf(pixel);
                    pixel.style.backgroundColor = color; // Set the selected color
                    // Send the pixel update to the server
                    socket.emit('updatePixel', { index, color });
                }
            });
        });
    }
    

    // Function to remove click event listeners from pixels
    function removeEyedropperEventListeners() {
        const pixels = document.querySelectorAll('.pixel');
        pixels.forEach(pixel => {
            pixel.removeEventListener('click', () => {
                // No action needed here, just remove the event listener
            });
        });
    }

    // Add a click event listener to the eyedropper button to toggle the tool
    eyedropperButton.addEventListener('click', toggleEyedropper);

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

    function updateColorPickerValue() {
        const colorPicker = document.getElementById("color-picker");
        colorPicker.value = currentColor;
        console.log(`Custom color has been updated to: ${currentColor}`);
    }

    function updateColorPickerValueRGB() {
        const colorPicker = document.getElementById("color-picker");
        colorPicker.value = rgbToHex(currentColor);
        console.log(`Custom color has been updated to: ${currentColor}`);
    }

    function createGrid() {
        console.log('Creating grid...');
        const canvasContainer = document.querySelector(".canvas-container");

        for (let i = 0; i < 30 * 50; i++) {
            const pixel = createPixel();
            pixel.style.backgroundColor = "fff"; // Set the initial background color to white
            pixel.style.width = "20px"; // Set the pixel size
            pixel.style.height = "20px"; // Set the pixel size
            canvasContainer.appendChild(pixel);
        }
        console.log("grid created")
    }


    // Call the function to create the grid when the page loads
    window.addEventListener("load", createGrid);

    // Event listeners for preset color circles
    const colorPresets = document.querySelectorAll(".color-preset");

    colorPresets.forEach(preset => {
        const color = preset.getAttribute("data-color");
        
        // Add click event to set the current color when a preset is clicked
        preset.addEventListener("click", () => {
            if (isEyedropperActive) {
                toggleEyedropper(); // Deactivate the eyedropper tool
            } else {
                // Expand the clicked preset
                colorPresets.forEach(p => {
                    p.style.width = "30px"; // Reset width for all presets
                    p.style.height = "30px"; // Reset height for all presets
                });
                preset.style.width = "35px"; // Expand the width when selected
                preset.style.height = "35px"; // Expand the height when selected
                setCurrentColor(color);
            }
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
        if (isEyedropperActive) {
            toggleEyedropper(); // Deactivate the eyedropper tool
        }
        const color = getColor();
        setCurrentColor(color);
    });

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

});