var timeVar = document.getElementById("timer");
var timeLeft = 0;
var timeStart = 1 * 60;
var timerId;

document.addEventListener('DOMContentLoaded', function () {
    console.log("DOMContentLoaded event fired");

    const socket = io();

    // Listen for updates to the remaining time from the server
    socket.on('updateRemainingTime', (remainingTime) => {
        timeLeft = remainingTime;
        updateTimeLeft();
    });

    // Listen for updates to the current prompt from the server
    socket.on('updatePrompt', (newPrompt) => {
        updateCurrentPrompt(newPrompt);
    });

    function startTimer() {
        clearInterval(timerId); 
        timerId = setInterval(countdown, 1000); 
    }

    startTimer();

    function countdown() {
        console.log("Countdown function called");
        if (timeLeft <= 0) {
            timeLeft = timeStart;
            clearCanvas();
            updateTimerVals();
        } else {
            timeLeft--;
            updateTimeLeft();
        }
    }

    function updateTimeLeft() {
        timeVar.innerHTML = "Time Until Mosaic Clears: " + Math.floor(timeLeft / 60) + ":" + (timeLeft % 60).toString().padStart(2, '0');
    }

    function updateCurrentPrompt(newPrompt) {
        const currentPromptElement = document.getElementById("current-prompt");
        currentPromptElement.innerHTML = newPrompt;
    }

    updateCurrentPrompt("Loading..."); 

    function updateTimerVals() {
        updateTimeLeft();
    }

});
