// HTML elements
const heading = document.getElementById('heading');
const circle = document.getElementById('pomodoro-circle');
const time = document.getElementById('pomodoro-time');
const pomodoroControl = document.getElementById('pomodoro-control');
const pomodoroStart = document.getElementById('pomodoro-start');
const blackDiv = document.getElementById('black-screen');

const pauseBtn = document.getElementById('pause-btn');
const deleteBtn = document.getElementById('delete-btn');
const deactivateBtn = document.getElementById('deactivate-btn');

const alarm = new Audio('./assets/alarm-sound.mp3');

// Time
let workLength = 0.2 * 60;
let timeLeft = workLength;
let isBreak;

let intervalId;

const blackScreen = {
    hide: () => {
        blackDiv.style.display = 'none';
        document.exitFullscreen().catch(err => console.warn(`Caught Error: ${err}`));
        deactivateBtn.blacked = 'false';
    },
    show: () => {
        blackDiv.style.display = 'block';
        blackDiv.requestFullscreen();
        deactivateBtn.blacked = 'true';
    }
}

const work = {
    start: () => {
        pomodoroControl.style.display = 'flex';
        pomodoroStart.style.display = 'none';
        heading.innerText = 'Working';
        timeLeft = workLength - 1;
        isBreak = false;
        intervalId = setInterval(decreaseTime, 1000);
    },
    delete: () => {
        pomodoroControl.style.display = 'none';
        pomodoroStart.style.display = 'flex';
        heading.innerText = 'Pomodoro Timer';
        clearInterval(intervalId);
        resetTime();
    },
    decrease: () => {
        workLength -= 300;
        if (workLength < 300) {
            workLength = 300;
        }
        timeLeft = workLength;
        updateTimeText();
    },
    increase: () => {
        workLength += 5 * 60;
        timeLeft = workLength;
        updateTimeText();
    }
}

function decreaseTime() {
    circle.style.setProperty('--progress', ((workLength - timeLeft) / workLength) * 100 + '%');
    updateTimeText();
    if (timeLeft >= 0) {
        timeLeft -= 1;
        return;
    }
    if (isBreak) {
        sendNotification('Break is over!', 'Time to get back to work!');
        work.delete();
    }
    else {
        sendNotification('Break starts!', 'Take a short break and relax!');
        startBreak();
    }
}

function resetTime() {
    circle.style.setProperty('--progress', '0%');
    timeLeft = workLength;
    updateTimeText();
}

function pauseTime() {
    if (pauseBtn.paused == 'true') {
        intervalId = setInterval(decreaseTime, 1000);
        pauseBtn.paused = 'false';
        pauseBtn.innerText = 'Pause';
        deleteBtn.disabled = false;
    }
    else {
        clearInterval(intervalId);
        pauseBtn.paused = 'true';
        pauseBtn.innerText = 'Continue';
        deleteBtn.disabled = true;
    }
}

function updateTimeText() {
    const minutes = String(Math.floor(timeLeft / 60));
    const seconds = String(timeLeft % 60);
    time.innerText = `${minutes}:${seconds.padStart(2, '0')}`;
}

function startBreak() {
    circle.style.setProperty('--progress', ((workLength - timeLeft) / workLength) * 100 + '%');
    heading.innerText = 'Break';
    timeLeft = Math.round(workLength / 5);
    updateTimeText();
    isBreak = true;
}

function sendNotification() {
    alarm.play();
    blackScreen.hide();
}

async function requestWakeLock() {
    try {
        if ('wakeLock' in navigator) {
            wakeLock = await navigator.wakeLock.request('screen');
        } else {
            console.log('Wake Lock API is not supported on this device.');
        }
    } catch (err) {
        console.warn(`Caught Error: ${err}`);
    }
}

updateTimeText();
requestWakeLock();