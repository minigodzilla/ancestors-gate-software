const worker = new SharedWorker('js/videoSyncWorker.js');

let inCountdown = false;
let inPortal = false;
let inContent = false;
let countdownTimeout;
let portalTimeout;
let activeWindow;

window.addEventListener("focus", (event) => {
  activeWindow = true;
});

window.addEventListener("blur", (event) => {
  activeWindow = false;
});

worker.port.onmessage = function (event) {

    console.log(event.data);
    postMessageHandler(event);


    if (event.data === 'userHungUpDuringCountdown' || 
        event.data === 'userHungUpDuringPortal' || 
        event.data === 'userHungUpDuringContent' ) {
        clearTimeout(countdownTimeout);
        clearTimeout(portalTimeout);
        inCountdown = false;
        inPortal = false;
        inContent = false;
    };

    if (event.data === 'userPickedUp') {
        inCountdown = true;
        inPortal = false;
        inContent = false;

        countdownTimeout = setTimeout(() => {
            if (inCountdown) {
                inCountdown = false;
                inPortal = true;
                inContent = false;

                if (activeWindow) worker.port.postMessage("inPortal");
            }
        }, 6000);

        portalTimeout = setTimeout(() => {
            if (inPortal) {
                inCountdown = false;
                inPortal = false;
                inContent = true;

                if (activeWindow) worker.port.postMessage("inContent");
            }
        }, 10000);

    }
};

function pickUp(e) {
    worker.port.postMessage('userPickedUp');
}

function hangUp(e) {
    if (inCountdown) {
        if (activeWindow) worker.port.postMessage('userHungUpDuringCountdown');
    } else if (inPortal) {
        if (activeWindow) worker.port.postMessage('userHungUpDuringPortal');
    } else if (inContent) {
        if (activeWindow) worker.port.postMessage('userHungUpDuringContent');
    }
}

function playTone(t) {
    tone = document.getElementById("tone-" + t);
    tone.play();
}

function stopTone() {
    tone.pause();
    tone.load();
}

let isButton = true;

function keyDownHandler(e) {
    activeWindow = true;
    const evtobj = window.event ? event : e
    if (evtobj.ctrlKey && evtobj.altKey && evtobj.shiftKey) {
        isButton = false;
        if (evtobj.keyCode == 80) pickUp();
        if (evtobj.keyCode == 72) hangUp();
    } else {
        isButton = true;
    }
    if (evtobj.keyCode == 49) playTone(1);
    if (evtobj.keyCode == 50) playTone(2);
    if (!evtobj.shiftKey && evtobj.keyCode == 51) playTone(3);
    if (evtobj.keyCode == 52) playTone(4);
    if (evtobj.keyCode == 53) playTone(5);
    if (evtobj.keyCode == 54) playTone(6);
    if (evtobj.keyCode == 55) playTone(7);
    if (!evtobj.shiftKey && evtobj.keyCode == 56) playTone(8);
    if (evtobj.keyCode == 57) playTone(9);
    if (evtobj.shiftKey && evtobj.keyCode == 56) playTone("star");
    if (evtobj.keyCode == 48) playTone(0);
    if (evtobj.shiftKey && evtobj.keyCode == 51) playTone("pound");
}

function keyUpHandler(e) {
    if (isButton) stopTone();
}

document.onkeydown = keyDownHandler;
document.onkeyup = keyUpHandler;
