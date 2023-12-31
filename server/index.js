const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const { getSystemErrorName } = require('util');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// static files
app.use(express.static(path.join(__dirname, '../client')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/index.html'));
});

const pixels = new Array(30 * 50).fill('#ffffff');

// countdown time
let remainingTime = 10 * 60; 
let startTime = 10 * 60;
let timerId;
let flag = true;

const prompts = [
    "Bell Tower",
    "Purdue Pete",
    "Pete's Za",
    "Engineering Fountain",
    "World's Biggest Drum",
    "Unfinished P",
    "Boilermaker Special",
    "Ross-Ade Brigade",
    "Fountain Run",
    "Harry's Chocolate Shop",
    "Purdue Airport",
    "Purdue Arch",
    "Purdue (anything about Purdue)",
    "Moon Landing",
    "Lion Statue",
    "BoilerBall",
    "Indiana University",
    "Den Pop",
    "BONUS PROMPT: Free draw!"
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

    socket.emit('initialPixels', pixels);  
    // console.log(pixels); 

    if (flag) {
        socket.emit('updatePrompt', initPrompt);
    }
    else {
        socket.emit('updatePrompt', randomPrompt);
    }

    socket.on('updatePixel', (data) => {
        pixels[data.index] = data.color;

        io.emit('updatePixel', { index: data.index, color: data.color });
    });

    socket.on('updateRemainingTime', (newRemainingTime) => {
        remainingTime = newRemainingTime;

        io.emit('updateRemainingTime', remainingTime);
    });

    socket.emit('updateRemainingTime', remainingTime);

    if (!timerId) {
        startTimer();
    }
});

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
        io.emit('updateRemainingTime', remainingTime);
    }, 1000);
}

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
