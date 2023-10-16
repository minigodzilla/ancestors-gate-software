const worker = new SharedWorker('js/videoSyncWorker.js');

// data object of the site's content
const videos = {
  gawai: {
    title: 'Gawai',
    article: '<p>Lorem Ipsum</p>',
    length: 210000, // 3:30
    credit1Title: 'Co-researchers',
    credit1Names: ['Tina Carmillia', 'Adrian J Nyaoi', 'Steve Tekaronhiake Diabo'],
    credit2Title: 'Camera',
    credit2Names: ['Adrian J Nyaoi'],
    credit3Title: 'Editing by',
    credit3Names: ['Steve Tekaronhiake Diabo'],
  },
  paoakalani: {
    title: 'Kuʻu Pua I Paoakalani',
    article: '<p>Lorem Ipsum</p>',
    length: 231000, // 3:51
    credit1Title: 'Co-researchers',
    credit1Names: ['Kuʻuipo Kumukahi', 'Jeninne Heleloa', 'Hawaiian Music Perpetuation Society (HMPS)', 'Steve Tekaronhiake Diabo'],
    credit2Title: 'Music performed by',
    credit2Names: ['Kuʻuipo Kumukahi'],
    credit3Title: 'Visuals and editing by',
    credit3Names: ['Steve Tekaronhiake Diabo'],
  },
  'the-difference': {
    title: 'The Difference (100 years from now)',
    article: '<p>Lorem Ipsum</p>',
    length: 283000, // 4:43
    credit1Title: 'Co-researchers',
    credit1Names: ['Elliott Doxtater-Wynn', 'Steve Tekaronhiake Diabo'],
    credit2Title: 'Music performed by',
    credit2Names: ['Elliott Doxtater-Wynn'],
    credit3Title: 'Visuals by',
    credit3Names: ['Steve Tekaronhiake Diabo'],
  },
};

let inCountdown = false;
let inPortal = false;
let inContent = false;
let countdownTimeout;
let portalTimeout;
let contentTimeout;
let resetTimeout;
let activeWindow;
let contentSlug;
let contentTimeoutDuration;

window.addEventListener('focus', (event) => {
  activeWindow = true;
});

window.addEventListener('blur', (event) => {
  activeWindow = false;
});

worker.port.onmessage = function (event) {
  console.log(event.data);
  postMessageHandler(event);

  if (event.data === 'userHungUpDuringCountdown' || event.data === 'userHungUpDuringPortal' || event.data === 'userHungUpDuringContent') {
    clearTimeout(countdownTimeout);
    clearTimeout(portalTimeout);
    clearTimeout(contentTimeoutDuration);
    clearTimeout(resetTimeout);
    inCountdown = false;
    inPortal = false;
    inContent = false;
  }

  if (event.data === 'userPickedUp') {
    inCountdown = true;

    countdownTimeout = setTimeout(() => {
      if (inCountdown) {
        inCountdown = false;
        inPortal = true;

        if (activeWindow) worker.port.postMessage('inPortal');
      }
    }, 5500);

    portalTimeout = setTimeout(() => {
      if (inPortal) {
        inPortal = false;
        inContent = true;

        if (activeWindow) worker.port.postMessage('inContent');
      }
    }, 10000);

    resetTimeout = setTimeout(() => {
      if (inContent) {
        inContent = false;

        if (activeWindow) worker.port.postMessage('contentFinished');
      }
    }, 10000 + contentTimeoutDuration);
  }
};

function getRandomVideo() {
  // Get an array of video keys from the 'videos' object
  const videoKeys = Object.keys(videos);

  // Generate a random index between 0 and the length of the videoKeys array
  const randomIndex = Math.floor(Math.random() * videoKeys.length);

  // Get the video object at the random index
  const randomVideo = videos[videoKeys[randomIndex]];

  // Set the 'contentSlug' global variable to the name of the selected video
  contentSlug = videoKeys[randomIndex];

  // Set the 'contentTimeoutDuration' global variable to the length of the selected video
  contentTimeoutDuration = randomVideo.length;

  console.log('Content Slug:', contentSlug);
  console.log('Content Timeout:', contentTimeoutDuration);

  // Return an object with both content length and content slug (optional)
  return {
    contentSlug,
    contentTimeoutDuration,
  };
}

function pickUp(e) {
  getRandomVideo();
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
  tone = document.getElementById('tone-' + t);
  tone.volume = 0.2;
  tone.play();
}

function stopTone() {
  tone.pause();
  tone.load();
}

let isButton = true;

function keyDownHandler(e) {
  activeWindow = true;
  const evtobj = window.event ? event : e;
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
  if (evtobj.shiftKey && evtobj.keyCode == 56) playTone('star');
  if (evtobj.keyCode == 48) playTone(0);
  if (evtobj.shiftKey && evtobj.keyCode == 51) playTone('pound');
}

function keyUpHandler(e) {
  if (isButton) stopTone();
}

document.onkeydown = keyDownHandler;
document.onkeyup = keyUpHandler;
