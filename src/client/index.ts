import { log } from './log';

const videoEl = document.getElementById('video') as HTMLVideoElement;
const btnEl = document.getElementById('btn') as HTMLButtonElement;

btnEl.addEventListener('click', async () => {
  videoEl.currentTime = 0;
  await videoEl.play();
  await videoEl.requestFullscreen();
  videoEl.removeAttribute('hidden');
});

videoEl.addEventListener('fullscreenchange', () => {
  if (!document.fullscreenElement) {
    videoEl.pause();
    videoEl.setAttribute('hidden', 'true');
  } else {
    log('rickrolled-counter');
  }
});

videoEl.addEventListener('ended', () => {
  videoEl.setAttribute('hidden', 'true');
  document.exitFullscreen();
});
