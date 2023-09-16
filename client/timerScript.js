var timeVar = document.getElementById("timer")
var timeStart = 30; //start time
var timeLeft = 30; //initializing timeleft timer rn

var timerId = setInterval(countdown, 1000); //will run the countdown function every second

function countdown() {
    if (timeLeft == -1) {
        timeLeft = timeStart;
        //add a function here to change prompt when timer reaches zero
        clearCanvas()
    } else {
        timeVar.innerHTML = "Time Remaining: " + timeLeft;
        timeLeft--;
    }
}