// Define the sound type
let soundType = "sine";
// get reference to the buttons
const sineWaveButton = document.getElementById("sineWaveButton");
const squareWaveButton = document.getElementById("squareWaveButton");
const sawtoothWaveButton = document.getElementById("sawtoothWaveButton");
const triangleWaveButton = document.getElementById("triangleWaveButton");
const playButton = document.getElementById("playButton");
const stopButton = document.getElementById("stopButton");
const pianoKeys = document.querySelectorAll(".pianoKey");
const notePlaceingAreas = document.querySelectorAll(".notePlaceingArea");
// add event listeners to the buttons
sineWaveButton.addEventListener("click", () => {
  soundType = "sine";
});
squareWaveButton.addEventListener("click", () => {
  soundType = "square";
});
sawtoothWaveButton.addEventListener("click", () => {
  soundType = "sawtooth";
});
triangleWaveButton.addEventListener("click", () => {
  soundType = "triangle";
});
playButton.addEventListener("click", () => {
  notes.forEach((note) => {
    playNote(note.dataNote, note.length);
  });
});
// Define the frequency map for the keys
const frequencyMap = {
  q: 261.63,
  w: 277.18,
  e: 293.66,
  r: 311.13,
  t: 329.63,
  y: 349.23,
  u: 369.99,
  i: 392.0,
  o: 415.3,
  p: 440.0,
  a: 466.16,
  s: 493.88,
  d: 523.25,
  f: 554.37,
  g: 587.33,
  h: 622.25,
  j: 659.25,
  k: 698.46,
  l: 739.99,
  z: 783.99,
  x: 830.61,
  c: 880.0,
  v: 932.33,
  b: 987.77,
  n: 1046.5,
  m: 1108.73,
};

// Create an AudioContext
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

// Object to store active oscillators
const activeOscillators = {};

// Array to store notes
const notes = [];

pianoKeys.forEach((key) => {
  key.addEventListener("mousedown", () => {
    // get the key data-note attribute
    let keyToPlay = key.getAttribute("data-note");
    playNote(keyToPlay);
  });
});

addEventListener("mouseup", () => {
  for (let key in activeOscillators) {
    stopNote(key);
  }
});

notePlaceingAreas.forEach((area) => {
  area.addEventListener("mousedown", () => {
    addNote(area);
  });
});

// move mouse to resize selected note
document.addEventListener("mousemove", (event) => {
  let selectedNote = notes.find((note) => note.selected);
  if (selectedNote) {
    const width = selectedNote.length / 20;
    if (event.clientX > selectedNote.x + width) {
      selectedNote.length += 1000;
    } else {
      selectedNote.length -= 1000;
    }
    if (selectedNote.length < 1000) {
      selectedNote.length = 1000;
    }
    selectedNote.element.style.width = width + "px";
  }
});

function addNote(area) {
  let x = Math.floor(event.offsetX / 50) * 50 + 50 + 8;
  const areaDataNote = area.getAttribute("data-note");
    notes.forEach((note) => {
      note.selected = false;
      note.element.classList.remove("selected");
    });
  // Check if note already exists
  if (notes.some((note) => note.dataNote === areaDataNote && note.x === x)) {
    let existingNote = notes.find((note) => note.dataNote === areaDataNote && note.x === x);
    existingNote.selected = true;
    existingNote.element.classList.add("selected");
    return; 
  }
  playNote(areaDataNote);
  let note = document.createElement("div");
  note.classList.add("note");
  // snap to grid for every 50 px of the area
  note.style.left = x + "px";
  area.appendChild(note);
  notes.push({
    dataNote: areaDataNote,
    x: x,
    selected: false,
    element: note,
    length: 1000, // 1 second
  });
}

// Function to play a note
function playNote(key, length) {
  if (!frequencyMap[key] || activeOscillators[key]) return; // Avoid retriggering

  // Create an oscillator
  const oscillator = audioContext.createOscillator();
  oscillator.type = soundType;

  // Set the frequency
  oscillator.frequency.setValueAtTime(
    frequencyMap[key],
    audioContext.currentTime
  );

  // Create a gain node to control the volume
  const gainNode = audioContext.createGain();
  gainNode.gain.setValueAtTime(0.1, audioContext.currentTime); // Volume

  // Connect the oscillator to the gain node and the gain node to the destination (speakers)
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  // Start the oscillator
  oscillator.start();

  // Store the oscillator so we can stop it later
  activeOscillators[key] = oscillator;

  if (length) {
    setTimeout(() => {
      stopNote(key);
    }, length);
  }
}

// Function to stop the note
function stopNote(key) {
  if (activeOscillators[key]) {
    activeOscillators[key].stop();
    delete activeOscillators[key];
  }
}

// Event listeners for keydown and keyup
document.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  playNote(key);
});

document.addEventListener("keyup", (event) => {
  const key = event.key.toLowerCase();
  stopNote(key);
});
