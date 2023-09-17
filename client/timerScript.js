var timeVar = document.getElementById("timer");
var timeLeft = 0; // Initialize timeLeft to 0
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

    // Create a function to start the timer
    function startTimer() {
        clearInterval(timerId); // Clear any existing timer
        timerId = setInterval(countdown, 1000); // Start a new timer
    }

    // Call the initial startTimer function
    startTimer();

    function countdown() {
        console.log("Countdown function called");
        if (timeLeft <= 0) {
            timeLeft = timeStart;
            // Handle when the timer reaches zero (e.g., change prompt, clear canvas)
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

    // Updates the current prompt
    function changeCurrentPrompt() {
        const prompts = [
            "Bell Tower",
            "Purdue Pete",
            "Pete's Za",
            "Engineering Fountain",
            "World's Biggest Drum",
            "Unfinished P",
            "Bell Tower",
            "Boilermaker Special",
            "Ross-Ade Brigade",
            "Fountain Run",
            "BONUS PROMPT: Free draw!"
        ];
        const newPrompt = prompts[Math.floor(Math.random() * prompts.length)];
        const currentPromptElement = document.getElementById("current-prompt");
        currentPromptElement.innerHTML = newPrompt;
    }

    // Call the initial changeCurrentPrompt function
    changeCurrentPrompt();

    function updateTimerVals() {
        updateTimeLeft();
        changeCurrentPrompt();
    }

    // Function to clear canvas (you can implement this)
    function clearCanvas() {
        // Implement your canvas clearing logic here
    }
});
