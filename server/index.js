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

const maxHistory = 6;
const history = [
    { type: 'image', src: './assets/prevCanvas/canvas-5.png', prompt: 'Bell Tower' },
    { type: 'image', src: './assets/prevCanvas/canvas-6.png', prompt: 'Ross-Ade Brigade' },
    { type: 'image', src: './assets/prevCanvas/canvas-8.png', prompt: 'World\'s Biggest Drum' },
    { type: 'image', src: './assets/prevCanvas/canvas-13.png', prompt: 'Den Pop' },
    { type: 'image', src: './assets/prevCanvas/canvas-9.png', prompt: 'Free draw!' },
    { type: 'image', src: './assets/prevCanvas/canvas-12.png', prompt: 'Moon Landing' },
];

app.get('/api/history', (req, res) => {
    res.json(history);
});

// countdown time
let remainingTime = 5 * 60; 
let startTime = 5 * 60;
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
    "Free draw!"
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
            const isEmpty = pixels.every(color => color === '#ffffff' || color === '#fff');
            if (!isEmpty) {
                history.push({
                    type: 'pixels',
                    prompt: flag ? initPrompt : randomPrompt,
                    pixels: [...pixels]
                });
                if (history.length > maxHistory) {
                    history.shift();
                }
            }
            
            pixels.fill('#ffffff');
            io.emit('initialPixels', pixels);

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
