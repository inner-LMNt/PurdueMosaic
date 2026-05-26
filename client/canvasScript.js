document.addEventListener('DOMContentLoaded', () => {
    var socket = io();

    // Global array to cache pixel DOM nodes for O(1) updates
    let pixelsArray = [];
    let currentColor = '#000000'; 
    let isEyedropperActive = false;

    socket.on('userCount', (count) => {
        const userCountElement = document.getElementById('user-count')
        userCountElement.innerHTML = "Active Users: " + count;
    });

    const timeVar = document.getElementById("timer");
    const currentPromptElement = document.getElementById("current-prompt");
    currentPromptElement.innerHTML = "Loading...";

    socket.on('updateRemainingTime', (remainingTime) => {
        timeVar.innerHTML = "Time Until New Prompt: " + Math.floor(remainingTime / 60) + ":" + (remainingTime % 60).toString().padStart(2, '0');
    });

    socket.on('updatePrompt', (newPrompt) => {
        currentPromptElement.innerHTML = newPrompt;
    });

    socket.on('initialPixels', (initialPixels) => {
      pixelsArray.forEach((pixel, index) => {
        pixel.style.backgroundColor = initialPixels[index];
      });
    });

    socket.on('updatePixel', (data) => {
      if (pixelsArray[data.index]) {
          pixelsArray[data.index].style.backgroundColor = data.color;
      }
    });

    socket.on('timerZeroReached', () => {
        // clearCanvas();
        // console.log('Grid reset.');
    });

    function rgbToHex(rgb) {
        const rgbArray = rgb.match(/\d+/g);
        if (rgbArray) {
            return "#" + rgbArray.map(value => {
                const hex = parseInt(value, 10).toString(16); 
                return hex.length === 1 ? "0" + hex : hex;
            }).join("");
        }
        return "#000000"; 
    }
  
    let isDrawing = false;

    document.addEventListener('mousedown', () => {
        isDrawing = true;
    });

    document.addEventListener('mouseup', () => {
        isDrawing = false;
    });

    function paintPixel(pixel, index) {
        if (isEyedropperActive) {
            const pixelColor = window.getComputedStyle(pixel).backgroundColor;
            currentColor = pixelColor;
            document.getElementById("color-picker").value = rgbToHex(currentColor); 
            console.log(`Selected color: ${currentColor}`);
            updateColorPickerValueRGB();
            toggleEyedropper(); 
        } else {
            const color = currentColor;
            pixel.style.backgroundColor = color; 
            socket.emit('updatePixel', { index, color });
        }
    }

    function createPixel(index) {
      const pixel = document.createElement('div');
      pixel.className = 'pixel';
  
      pixel.addEventListener('mousedown', (e) => {
          e.preventDefault(); 
          paintPixel(pixel, index);
      });

      pixel.addEventListener('mouseenter', (e) => {
          if (isDrawing) {
              paintPixel(pixel, index);
          }
      });
  
      return pixel;
    }

    function setCurrentColor(color) {
        currentColor = color;
        const colorPresets = document.querySelectorAll(".color-preset");

        colorPresets.forEach(preset => {
            preset.classList.remove("selected");
            preset.style.borderColor = "transparent";
        });

        const selectedPreset = document.querySelector(`[data-color="${color}"]`);
        if (selectedPreset) {
            selectedPreset.classList.add("selected");
        }

        updateColorPickerValue();
    }

    const eyedropperButton = document.getElementById('eyedropper-button');

    function toggleEyedropper() {
        isEyedropperActive = !isEyedropperActive; 
    
        const colorPresets = document.querySelectorAll(".color-preset");
        colorPresets.forEach(preset => {
            preset.classList.remove("selected");
        });
    
        if (isEyedropperActive) {
            eyedropperButton.classList.add('active'); 
        } else {
            eyedropperButton.classList.remove('active'); 
        }
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
    }

    function updateColorPickerValueRGB() {
        const colorPicker = document.getElementById("color-picker");
        colorPicker.value = rgbToHex(currentColor);
    }

    function createGrid() {
        console.log('Creating grid...');
        const canvasContainer = document.querySelector(".canvas-container");
        canvasContainer.innerHTML = ''; // Clear just in case
        pixelsArray = []; // Reset array

        for (let i = 0; i < 30 * 50; i++) {
            const pixel = createPixel(i);
            pixel.style.backgroundColor = "#fff"; 
            canvasContainer.appendChild(pixel);
            pixelsArray.push(pixel);
        }
        console.log("grid created");
    }

    window.addEventListener("load", createGrid);

    const colorPresets = document.querySelectorAll(".color-preset");

    colorPresets.forEach(preset => {
        const color = preset.getAttribute("data-color");
        
        preset.addEventListener("click", () => {
            if (isEyedropperActive) {
                toggleEyedropper(); 
            }
            setCurrentColor(color);
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
        if (tempCanvas === null) return;

        const dataURL = tempCanvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.href = dataURL;
        downloadLink.download = 'canvas.png';
        downloadLink.click();
    }

    function createTempCanvas() {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = 50 * 20; 
        tempCanvas.height = 30 * 20;
        const context = tempCanvas.getContext('2d');

        if (pixelsArray.length === 0) {
            console.error('No pixels found in the grid.');
            return null;
        }

        pixelsArray.forEach((pixel, index) => {
            const x = (index % 50) * 20; 
            const y = Math.floor(index / 50) * 20;
            const pixelColor = window.getComputedStyle(pixel).backgroundColor;
            context.fillStyle = pixelColor;
            context.fillRect(x, y, 20, 20);
        });

        return tempCanvas;
    }

    function exportCanvasAsPNG() {
        downloadCanvas();
    }

    function clearCanvas() { 
        pixelsArray.forEach(pixel => {
            pixel.style.backgroundColor = "#fff";
        });
    }

    const downloadButton = document.getElementById('download-button');
    downloadButton.addEventListener('click', downloadCanvas);

});
