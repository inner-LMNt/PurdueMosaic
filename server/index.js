const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const { getSystemErrorName } = require('util');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files
app.use(express.static(path.join(__dirname, '../client')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/index.html'));
});

let remainingTime = 1 * 20; // Initialize remaining time here
let startTime = 1 * 20;
let timerId;
let flag = true;

const prompts = [
    "Bell Tower",
    "Purdue Pete",
    "Pete's Za",
    "Engineering Fountain",
    "World's Biggest Drum",
    "Unfinished P"
];

var initPrompt = getRandomPrompt();
var randomPrompt = "";

function getRandomPrompt() {
    const randomIndex = Math.floor(Math.random() * prompts.length);
    return prompts[randomIndex];
}

let userCount = 0;

io.on('connection', (socket) => {
    console.log('A user connected');
    userCount++;
    io.emit('userCount', userCount);

    socket.on('disconnect', () => {
        console.log('A user disconnected');
        userCount--;
        io.emit('userCount', userCount)
    });

    const pixels = new Array(30 * 50).fill('#ffffff');
    socket.emit('initialPixels', pixels);   

    if (flag) {
        socket.emit('updatePrompt', initPrompt);
    }
    else {
        socket.emit('updatePrompt', randomPrompt);
    }

    // Handle messages from clients to update pixels
    socket.on('updatePixel', (data) => {
        // Update the pixel color
        pixels[data.index] = data.color;

        // Broadcast the updated pixel to all connected clients
        io.emit('updatePixel', { index: data.index, color: data.color });
    });

    // Listen for requests to update remaining time
    socket.on('updateRemainingTime', (newRemainingTime) => {
        // Update the remaining time
        remainingTime = newRemainingTime;

        // Broadcast the updated remaining time to all clients
        io.emit('updateRemainingTime', remainingTime);
    });

    // Send the initial remaining time to the connected client
    socket.emit('updateRemainingTime', remainingTime);

    // Start the timer when the first client connects
    if (!timerId) {
        startTimer();
    }
});

// Function to start the timer
function startTimer() {
    timerId = setInterval(() => {
        if (remainingTime > 0) {
            remainingTime--;
        }
        else {
            flag = false;
            remainingTime = startTime;
            io.emit('timerZeroReached');
            randomPrompt = getRandomPrompt();
            io.emit('updatePrompt', randomPrompt);
        }
        // Broadcast the updated remaining time to all clients
        io.emit('updateRemainingTime', remainingTime);
    }, 1000);
}

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
