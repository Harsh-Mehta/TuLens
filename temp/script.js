// script.js

const welcomeScreen  = document.getElementById('welcome-screen');
const startButton    = document.getElementById('startButton');
const arContainer    = document.getElementById('ar-container');
const loadingMessage = document.getElementById('loading-message');
const scanPrompt     = document.getElementById('scan-prompt');
const overlayFrame   = document.getElementById('overlayFrame');

const imageSceneElement = document.getElementById('imageScene');
const markerTarget      = document.getElementById('markerTarget');
const faceSceneElement  = document.getElementById('faceScene');
const faceTargetEntity  = document.getElementById('faceTarget');

let imageSceneSystem = null;
let faceSceneSystem  = null;
let faceTrackingHasAttemptedStart = false;

// Wait for MindAR systems to be ready
imageSceneElement.addEventListener('loaded', () => {
  imageSceneSystem = imageSceneElement.systems['mindar-image-system'];
  console.log('✅ mindar-image system loaded');
});
faceSceneElement.addEventListener('loaded', () => {
  faceSceneSystem = faceSceneElement.systems['mindar-face-system'];
  console.log('✅ mindar-face system loaded');
});

// 1) On “Start” click: show image AR & start scanning
startButton.addEventListener('click', async () => {
  console.log('▶️ Start Tu Lens clicked');
  welcomeScreen.style.display = 'none';
  arContainer.style.opacity   = 1;
  loadingMessage.style.display = 'block';
  scanPrompt.style.display    = 'none';
  overlayFrame.style.opacity   = 0;

  imageSceneElement.style.display = 'block';
  try {
    console.log('⏳ Starting image tracking…');
    await imageSceneSystem.start();
    console.log('✅ Image tracking started');
  } catch (e) {
    console.error('🚨 Error starting image AR:', e);
    loadingMessage.innerText = 'Error starting camera for image AR.';
    return;
  }

  loadingMessage.style.display = 'none';
  scanPrompt.style.display     = 'flex';
  console.log('🔍 Prompting scan of Shibir ID');
});

// 2) On marker found: teardown image AR, then kick off face AR
markerTarget.addEventListener('targetFound', () => {
  console.log('🎯 Marker detected');
  if (faceTrackingHasAttemptedStart) return;
  faceTrackingHasAttemptedStart = true;

  scanPrompt.style.display   = 'none';
  overlayFrame.style.opacity = 1;
  console.log('🖼️ Frame fade-in');

  setTimeout(async () => {
    console.log('⏳ Switching to face AR…');
    try {
      console.log('🛑 Stopping image AR…');
      await imageSceneSystem.stop();
      imageSceneElement.pause();
      imageSceneElement.setAttribute('visible', 'false');
      console.log('✅ Image AR stopped');
    } catch (e) {
      console.warn('⚠️ Could not fully stop image AR:', e);
    }
    imageSceneElement.style.display = 'none';

    faceSceneElement.style.display    = 'block';
    faceSceneElement.style.visibility = 'hidden';
    faceSceneElement.addEventListener('arReady', () => {
      console.log('😃 Face AR ready');
      faceSceneElement.style.visibility = 'visible';
    }, { once: true });

    faceSceneElement.addEventListener('arError', (err) => {
      console.error('🚨 Face AR Error:', err.error || err);
      loadingMessage.style.display = 'block';
      loadingMessage.innerText = 'Error initializing face AR.';
    });
    faceSceneElement.addEventListener('camera-error', (err) => {
      console.error('🚨 Face Scene Camera Error:', err.error || err);
      loadingMessage.style.display = 'block';
      loadingMessage.innerText = 'Camera error in Face Scene.';
    });

    try {
      console.log('🚀 Starting face tracking…');
      await faceSceneSystem.start();
      console.log('✅ Face AR started');
    } catch (e) {
      console.error('🚨 Error starting face AR:', e);
      loadingMessage.innerText = 'Failed to start face tracking.';
    }
  }, 1000);
});

// 3) Optional: debug face‐target events
faceTargetEntity.addEventListener('targetFound',  () => console.log('🤳 Face target found'));
faceTargetEntity.addEventListener('targetLost',   () => console.log('🤳 Face target lost'));