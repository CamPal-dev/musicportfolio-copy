const format = seconds => Number.isFinite(seconds) ? `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}` : '–:––';
const media = [];
function pauseOthers(current) { media.forEach(item => { if (item !== current) item.pause(); }); }

// Tracks: one plays at a time.
document.querySelectorAll('.track').forEach(track => {
  const audio = new Audio();
  audio.preload = 'metadata';
  audio.src = track.dataset.src;
  media.push(audio);
  const play = track.querySelector('.play');
  const seek = track.querySelector('.seek');
  const time = track.querySelector('.time');
  const title = track.querySelector('.track-title').firstChild.textContent.trim();
  const update = () => {
    const progress = audio.duration ? audio.currentTime / audio.duration * 100 : 0;
    seek.value = progress;
    seek.style.setProperty('--p', `${progress}%`);
    time.textContent = `${format(audio.currentTime)} / ${format(audio.duration)}`;
  };
  const refresh = () => {
    play.setAttribute('aria-pressed', String(!audio.paused));
    play.setAttribute('aria-label', `${audio.paused ? 'Play' : 'Pause'} ${title}`);
  };
  play.setAttribute('aria-pressed', 'false');
  play.addEventListener('click', () => {
    if (audio.paused) { pauseOthers(audio); audio.play().catch(refresh); } else audio.pause();
  });
  seek.addEventListener('input', () => {
    if (audio.duration) audio.currentTime = seek.value / 100 * audio.duration;
    seek.style.setProperty('--p', `${seek.value}%`);
  });
  ['loadedmetadata', 'timeupdate'].forEach(event => audio.addEventListener(event, update));
  ['play', 'pause', 'ended'].forEach(event => audio.addEventListener(event, refresh));
  audio.addEventListener('error', () => { time.textContent = 'unavailable'; });
});

// "view all" reveals the full track list.
const viewAll = document.querySelector('.view-all');
viewAll.addEventListener('click', () => {
  const open = viewAll.getAttribute('aria-expanded') !== 'true';
  viewAll.setAttribute('aria-expanded', String(open));
  viewAll.firstChild.textContent = open ? 'show less ' : 'view all ';
  document.querySelector('.tracks').classList.toggle('show-all', open);
});

// Performances: each row opens its video; lengths fill in from the files.
document.querySelectorAll('.show').forEach(show => {
  const button = show.querySelector('button');
  const panel = show.querySelector('.show-panel');
  const video = document.createElement('video');
  video.controls = true;
  video.playsInline = true;
  video.preload = 'metadata';
  video.src = show.dataset.video;
  video.poster = show.dataset.video.replace(/\.mp4$/, '.jpg');
  video.setAttribute('aria-label', button.firstElementChild.textContent);
  video.addEventListener('loadedmetadata', () => { show.querySelector('.length').textContent = format(video.duration); });
  video.addEventListener('play', () => pauseOthers(video));
  media.push(video);
  panel.append(video);
  button.addEventListener('click', () => {
    const open = button.getAttribute('aria-expanded') !== 'true';
    button.setAttribute('aria-expanded', String(open));
    panel.hidden = !open;
    if (!open) video.pause();
  });
});

// Contact opens as a pop-up.
const contact = document.querySelector('#contact-dialog');
document.querySelectorAll('[data-contact]').forEach(button => button.addEventListener('click', () => contact.showModal()));
contact.querySelector('.dialog-close').addEventListener('click', () => contact.close());
contact.addEventListener('click', event => { if (event.target === contact) contact.close(); });
