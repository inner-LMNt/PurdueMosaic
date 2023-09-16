var timeVar = document.getElementById("timer")
const timeStart = 15*60; //start time
var timeLeft = 15*60; //initializing timeleft timer rn

const prompts = [
    "Bell Tower",
    "Purdue Pete",
    "Pete's Za",
    "Engineering Fountain",
    "World's Biggest Drum",
    "Unfinished P"
]

updateTimerVals()
var timerId = setInterval(countdown, 1000); //will run the countdown function every minute

function countdown() {
    if (timeLeft == 0) {
        timeLeft = timeStart;
        //add a function here to change prompt when timer reaches zero
        clearCanvas()
    } else {
        timeLeft--;
        updateTimeLeft()
    }
}

function updateTimeLeft() {
    timeVar.innerHTML = "Time Remaining: " + Math.floor(timeLeft / 60) + ":" + (timeLeft % 60).toString().padStart(2, '0');
}

//updates current prompt
function changeCurrentPrompt() { 
    const newPrompt = prompts[Math.floor(Math.random() * prompts.length)];
    const currentPromptElement = document.getElementById("current-prompt");
    currentPromptElement.innerHTML = newPrompt;
}

function updateTimerVals() { //call when you need to update time remaining and change prompt
    updateTimeLeft()
    changeCurrentPrompt()
}