let kickDrumSound = document.getElementById('kick-drum');
let hiHatSound = document.getElementById('hi-hat');
let snareDrumSound = document.getElementById('snare-drum');
let percussiveSynthSound = document.getElementById('percussive-synth');

let kickDrumAudio = new Audio('kick-drum.mp3');
let hiHatAudio = new Audio('hi-hat.mp3');
let snareDrumAudio = new Audio('snare-drum.mp3');
let percussiveSynthAudio = new Audio('percussive-synth.mp3');

kickDrumSound.addEventListener('mousedown', playSound(kickDrumAudio));
kickDrumSound.addEventListener('mouseup', stopSound(kickDrumAudio));

hiHatSound.addEventListener('mousedown', playSound(hiHatAudio));
hiHatSound.addEventListener('mouseup', stopSound(hiHatAudio));

snareDrumSound.addEventListener('mousedown', playSound(snareDrumAudio));
snareDrumSound.addEventListener('mouseup', stopSound(snareDrumAudio));

percussiveSynthSound.addEventListener('mousedown', playSound(percussiveSynthAudio));
percussiveSynthSound.addEventListener('mouseup', stopSound(percussiveSynthAudio));

document.addEventListener('keydown', playKey);

function playSound(audio) {
    return function() {
        audio.play();
    };
}

function stopSound(audio) {
    return function() {
        audio.pause();
    };
}

function playKey(event) {
    switch (event.key) {
        case 'ArrowDown':
            playSound(kickDrumAudio)();
            break;
        case 'ArrowUp':
            playSound(hiHatAudio)();
            break;
        case 'ArrowLeft':
            playSound(snareDrumAudio)();
            break;
        case 'ArrowRight':
            playSound(percussiveSynthAudio)();
            break;
    }
}