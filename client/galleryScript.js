document.addEventListener('DOMContentLoaded', () => {
    const galleryGrid = document.getElementById('gallery-grid');
    const refreshButton = document.getElementById('refresh-button');
    const socket = io();

    if (refreshButton) {
        refreshButton.addEventListener('click', fetchHistory);
    }

    function fetchHistory() {
        fetch('/api/history')
            .then(res => res.json())
            .then(data => renderHistory(data))
            .catch(err => console.error("Error fetching history:", err));
    }

    function renderHistory(history) {
        galleryGrid.innerHTML = ''; 
        
        history.forEach(item => {
            const container = document.createElement('div');
            container.className = 'gallery-item';
            
            const title = document.createElement('div');
            title.className = 'gallery-item-title';
            title.innerText = item.prompt || "Purdue Mosaic";
            container.appendChild(title);

            let visualElement;

            if (item.type === 'image') {
                visualElement = document.createElement('img');
                visualElement.src = item.src;
                visualElement.alt = item.prompt || "Purdue Mosaic";
            } else if (item.type === 'pixels') {
                visualElement = document.createElement('canvas');
                visualElement.width = 50 * 20; 
                visualElement.height = 30 * 20; 
                visualElement.style.width = '250px'; 
                visualElement.style.height = 'auto';
                
                const ctx = visualElement.getContext('2d');
                item.pixels.forEach((color, index) => {
                    const x = (index % 50) * 20;
                    const y = Math.floor(index / 50) * 20;
                    ctx.fillStyle = color;
                    ctx.fillRect(x, y, 20, 20);
                });
            }

            visualElement.title = "Click to save!";
            visualElement.addEventListener('click', () => {
                const link = document.createElement('a');
                link.download = `${(item.prompt || 'mosaic').replace(/\s+/g, '_')}.png`;
                if (item.type === 'image') {
                    link.href = visualElement.src;
                } else {
                    link.href = visualElement.toDataURL('image/png');
                }
                link.click();
            });

            container.appendChild(visualElement);
            galleryGrid.appendChild(container);
        });
    }

    socket.on('timerZeroReached', () => {
        // Refresh the gallery automatically when a new round starts
        setTimeout(fetchHistory, 500); 
    });

    fetchHistory();
});
