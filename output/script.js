// Get the drum pad and buttons
const drumPad = document.getElementById('drum-pad');
const kickDrumButton = document.getElementById('kick-drum');
const hiHatButton = document.getElementById('hi-hat');
const snareDrumButton = document.getElementById('snare-drum');
const percussiveSynthButton = document.getElementById('percussive-synth');
const playButton = document.getElementById('play-button');

// Create an AudioContext to play the sounds
const audioContext = new AudioContext();
let kickDrumSound;
let hiHatSound;
let snareDrumSound;
let percussiveSynthSound;

// Load the sounds
function loadSounds() {
  // Kick Drum Sound
  kickDrumSound = createSound('kick-drum.mp3');
  // Hi-Hat Sound
  hiHatSound = createSound('hi-hat.mp3');
  // Snare Drum Sound
  snareDrumSound = createSound('snare-drum.mp3');
  // Percussive Synth Sound
  percussiveSynthSound = createSound('percussive-synth.mp3');
}

// Create a new sound
function createSound(url) {
  return new Promise((resolve, reject) => {
    const audioplayer = new Audio(url);
    audioplayer.load();
    resolve(audioplayer);
  });
}

// Add event listeners to the buttons
function addButtonListeners() {
  kickDrumButton.addEventListener('click', playSound(kickDrumSound));
  hiHatButton.addEventListener('click', playSound(hiHatSound));
  snareDrumButton.addEventListener('click', playSound(snareDrumSound));
  percussiveSynthButton.addEventListener('click', playSound(percussiveSynthSound));
  playButton.addEventListener('click', () => {
    const drumPadAudio = new AudioContext().createBufferSource();
    drumPadAudio.source.type = 'sine';
    drumPadAudio.buffer = new Float32Array(16);
    for (let i = 0; i < 16; i++) {
      drumPadAudio.buffer[16 * i + 3] = 1; // Create a simple 16-beat drumloop
    }
    drumPadAudio.start();
  });
}

// Play a sound
function playSound(sound) {
  return () => {
    sound.play();
  };
}

// Load the sounds and add button listeners
loadSounds().then(() => {
  addButtonListeners();
});