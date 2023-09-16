var timeVar = document.getElementById("timer")
const timeStart = 15; //start time
var timeLeft = 15; //initializing timeleft timer rn

updateTimeLeft()
var timerId = setInterval(countdown, 60000); //will run the countdown function every minute

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
    timeVar.innerHTML = "Time Remaining: " + timeLeft + " Minutes";
}