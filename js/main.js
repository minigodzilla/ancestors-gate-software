const worker = new SharedWorker('js/videoSyncWorker.js');

// data object of the site's content
const videos = {
  'suol-duoraana': {
    title: 'Suol duoraana',
    article: '<p>Suol Duoraana, or "Soul of the Path," is a love letter from musician Keskil Baishev to his community and his peoples.</p><p>In it, he refers to the "lineages and kinships" of his people -- this refers to both their families and ancestors, and to all other Turkic peoples, to which the Sakha are closely related by culture and ancestry.</p><p>As we walk through our lives, we should all remember that our ancestors walk with us -- both in blood and in spirit. Our ancestors are present in all aspects of our lives, our community and our environment. They protect us, guide us, and provide for us.</p><p>To celebrate our cultures today, as we always have, is to give our ancestors life.</p>',
    length: 290000, // 4:50
    credit1Title: 'Music by',
    credit1Names: ['Keskil Baishev'],
    credit2Title: 'Translation',
    credit2Names: ['Keskil Baishev', 'Sargylana Atlasova', 'Peter Samsonov', 'Steve Tekaronhiake Diabo'],
  },
  gawai: {
    title: 'Gawai',
    article:
      '<p>Gawai, or Gawai Dayak, is a significant cultural festival celebrated by the Dayak people, who are indigenous to the island of Borneo. This festival is primarily observed in the Malaysian state of Sarawak, as well as the Indonesian province of West Kalimantan. Gawai typically takes place on May 31 and June 1 each year.</p><p>The festival is a joyful and vibrant celebration of the Dayak culture, emphasizing their rich traditions, customs, and spirituality. It serves as an occasion for Dayak communities to come together, strengthen their bonds, and express their cultural identity. Central to the festivities is the offering of traditional rituals, dances, music, and elaborate feasts. The Dayak people wear colorful traditional attire, with intricate beadwork and headdresses, during these celebrations.</p><p>Offerings of rice wine (tuak) and symbolic items and ceremonies are made to appease the spirits and seek their blessings for a bountiful harvest and a prosperous year ahead. Additionally, cultural performances such as the Ngajat dance, showcasing graceful and rhythmic movements, are a highlight of the festival.</p><p>Gawai is not only a time of cultural preservation but also an opportunity for younger generations to learn about and appreciate their heritage. It has become a symbol of unity and pride for the Dayak people and is recognized as a public holiday in certain regions, underlining its importance in preserving the indigenous culture of Borneo.</p>',
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
    article:
      '<p>Queen Liliʻuokalani was the last sovereign to govern the Kingdom of Hawaiʻi prior to American annexation, and was loved and respected by the Hawaiian people. Refined and intelligent, as a princess she received Western education, and her creative pastimes included songwriting and poetry.</p><p>Following the overthrow of the monarchy, she was imprisoned, and held in her own palace, for eight months. Although she was under a news embargo, she was able to stay abreast of news of her own people, and of the world at large, through the delivery of flower bouquets from her gardens, which were covertly wrapped in newspapers. These were usually delivered by Johnny, the young son of her protégé and lady-in-waiting.</p><p><em>Nane</em> and <em>kaona</em>, riddles and layered meanings, can be found in many traditional Hawaiian songs and stories, including this <em>mele</em> that was written during her imprisonment. The many beautiful flowers represent the people of the Hawaiian islands. The fragrance is the news of her beloved people, and the gentle breeze which brings it is young Johnny.</p><p>Of the legacies left behind by Queen Liliʻuokalani, her music is a preservation of valuable knowledge, creativity and culture from an important era in Hawaiian history.</p>',
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
    article: '<p>100 years ago, First Nation medicine people and singers came forward to record their traditional drum songs. 100 years later, artists, musicians, and drummers have begun to find and relearn those songs. We have been learning from song keepers, songs handed down from long ago.</p><p>What are the teachings from those songs?</p><p><em>The Difference</em> is a song for the future. It asks future generations 100 years in the future: What did you do to save Mother Earth?  The lyrics are in both English and Anishnaabemowin (Ojibway).  English for mainstream culture. Ojibway speaks to your spirit. This is a song of reflection.</p><p>The song is combined with visuals from various travels, hikes and explorations across Turtle Island and beyond.</p>',
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
let userIsInvested;
let dpsIsShown;

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
    clearTimeout(resetTimeout);
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
