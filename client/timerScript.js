var timeVar = document.getElementById("timer")
const timeStart = 15*60; //start time
var timeLeft = 15*60; //initializing timeleft timer rn

updateTimeLeft()
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