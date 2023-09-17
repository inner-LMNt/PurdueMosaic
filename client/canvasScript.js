document.addEventListener('DOMContentLoaded', () => {
    var socket = io();

    socket.on('userCount', (count) => {
        const userCountElement = document.getElementById('user-count')
        userCountElement.innerHTML = "Active Users: " + String(Math.ceil(count/2));
    })
    // listen for 'initialPixels' event to get the initial pixel data from server
    socket.on('initialPixels', (initialPixels) => {
      const pixels = document.querySelectorAll('.pixel');
      pixels.forEach((pixel, index) => {
        pixel.style.backgroundColor = initialPixels[index];
      });
    });

    // listen for the 'updatePixel' event to receive real-time updates from other clients
    socket.on('updatePixel', (data) => {
      const pixels = document.querySelectorAll('.pixel');
      pixels[data.index].style.backgroundColor = data.color;
    });

    socket.on('timerZeroReached', () => {
        clearCanvas();
        console.log('Grid reset.');
    });
  
    let currentColor = '#000000'; 

    function rgbToHex(rgb) {
        // Split  RGB string into individual values
        const rgbArray = rgb.match(/\d+/g);
    
        if (rgbArray) {
            return "#" + rgbArray.map(value => {
                const hex = parseInt(value, 10).toString(16); 
                return hex.length === 1 ? "0" + hex : hex;
            }).join("");
        }
    
        return "#000000"; 
    }
  
    // create single pixel element
    function createPixel() {
      const pixel = document.createElement('div');
      pixel.className = 'pixel';
  
      // click to change pixel color
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

    function setCurrentColor(color) {
        currentColor = color;
        const colorPresets = document.querySelectorAll(".color-preset");

        colorPresets.forEach(preset => {
            preset.classList.remove("selected");
            preset.style.borderColor = "black";
        });

        const selectedPreset = document.querySelector(`[data-color="${color}"]`);
        if (selectedPreset) {
            selectedPreset.classList.add("selected");
            selectedPreset.style.borderColor = darkenColor(color); 
        }

        updateColorPickerValue();
    }

    const eyedropperButton = document.getElementById('eyedropper-button');

    let isEyedropperActive = false;

    function toggleEyedropper() {
        isEyedropperActive = !isEyedropperActive; 
    
        const colorPresets = document.querySelectorAll(".color-preset");
        colorPresets.forEach(preset => {
            preset.classList.remove("selected");
            preset.style.width = "30px"; 
            preset.style.height = "30px"; 
        });
    
        if (isEyedropperActive) {
            eyedropperButton.classList.add('active'); 
            addEyedropperEventListeners();
        } else {
            eyedropperButton.classList.remove('active'); 
            removeEyedropperEventListeners();
        }
    }

    function addEyedropperEventListeners() {
        const pixels = document.querySelectorAll('.pixel');
        pixels.forEach(pixel => {
            pixel.addEventListener('click', () => {
                if (isEyedropperActive) {
                    const pixelColor = window.getComputedStyle(pixel).backgroundColor;
                    currentColor = pixelColor;
                    document.getElementById("color-picker").value = currentColor; 
                    console.log(`Selected color: ${currentColor}`);
                    updateColorPickerValueRGB();
                } else {
                    const color = currentColor;
                    const index = Array.from(pixel.parentNode.children).indexOf(pixel);
                    pixel.style.backgroundColor = color; 
                    socket.emit('updatePixel', { index, color });
                }
            });
        });
    }
    
    function removeEyedropperEventListeners() {
        const pixels = document.querySelectorAll('.pixel');
        pixels.forEach(pixel => {
            pixel.removeEventListener('click', () => {
                
            });
        });
    }

    eyedropperButton.addEventListener('click', toggleEyedropper);

    function darkenColor(color) {
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);

        const darkenedR = Math.max(0, r - Math.round(r * 0.4));
        const darkenedG = Math.max(0, g - Math.round(g * 0.4));
        const darkenedB = Math.max(0, b - Math.round(b * 0.4));

        return `#${darkenedR.toString(16).padStart(2, "0")}${darkenedG.toString(16).padStart(2, "0")}${darkenedB.toString(16).padStart(2, "0")}`;
    }

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
            pixel.style.backgroundColor = "fff"; 
            pixel.style.width = "20px"; 
            pixel.style.height = "20px"; 
            canvasContainer.appendChild(pixel);
        }
        console.log("grid created")
    }

    // Call the function to create the grid when the page loads
    window.addEventListener("load", createGrid);

    const colorPresets = document.querySelectorAll(".color-preset");

    colorPresets.forEach(preset => {
        const color = preset.getAttribute("data-color");
        
        preset.addEventListener("click", () => {
            if (isEyedropperActive) {
                toggleEyedropper(); 
            } else {
                colorPresets.forEach(p => {
                    p.style.width = "30px"; 
                    p.style.height = "30px"; 
                });
                preset.style.width = "35px"; 
                preset.style.height = "35px"; 
                setCurrentColor(color);
            }
        });

        if (color === currentColor) {
            preset.classList.add("selected");
        }
    });

    const colorPicker = document.getElementById("color-picker");
    colorPicker.value = currentColor;
    colorPicker.addEventListener("input", () => {
        if (isEyedropperActive) {
            toggleEyedropper(); 
        }
        const color = getColor();
        setCurrentColor(color);
    });

    function downloadCanvas() {

        const tempCanvas = createTempCanvas();
        
        if (tempCanvas === null) {
            console.error('Failed to create a temporary canvas.'); 
            return;
        }

        const dataURL = tempCanvas.toDataURL('image/png');

        const downloadLink = document.createElement('a');
        downloadLink.href = dataURL;
        downloadLink.download = 'canvas.png';

        downloadLink.click();
    }

    function createTempCanvas() {
        const canvasContainer = document.querySelector('.canvas-container');
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = 50 * 20; 
        tempCanvas.height = 30 * 20;
        const context = tempCanvas.getContext('2d');

        const pixels = canvasContainer.querySelectorAll('.pixel');

        if (pixels.length === 0) {
            console.error('No pixels found in the grid.');
            return null;
        }

        pixels.forEach((pixel, index) => {
            const x = (index % 50) * 20; 
            const y = Math.floor(index / 50) * 20;

            const pixelColor = window.getComputedStyle(pixel).backgroundColor;

            context.fillStyle = pixelColor;

            context.fillRect(x, y, 20, 20);
        });

        return tempCanvas;
    }

    function exportCanvasAsPNG() {
        const tempCanvas = createTempCanvas();
        const dataURL = tempCanvas.toDataURL('image/png');

        const downloadLink = document.createElement('a');
        downloadLink.href = dataURL;
        downloadLink.download = 'canvas.png'; 

        downloadLink.click();
    }


    function clearCanvas() { 
        const pixels = document.querySelectorAll('.pixel');
                pixels.forEach(pixel => {
                    pixel.style.backgroundColor = "#fff";
                });
    }

    const downloadButton = document.getElementById('download-button');
    downloadButton.addEventListener('click', downloadCanvas);

});