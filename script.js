// ==========================================
// CHESS CLUB JEOPARDY
// Advanced Edition
// ==========================================

const categories = [
  "Advanced Openings",
  "Chess Calculation",
  "Advanced Tactics",
  "Chess Legends",
  "Rules & Endgames"
];

const questions = [
  [
    "Which opening is reached after 1.e4 c5?",
    "In the Queen's Gambit Declined, what is Black's typical response to 1.d4 d5 2.c4?",
    "What is the name of the opening variation beginning with 1.e4 e5 2.Nf3 Nc6 3.Bb5 a6 4.Ba4 Nf6 5.O-O Be7?",
    "In the King's Indian Defense, what is Black's main strategic pawn break against White's central pawn structure?",
    "What is the name of the sharp variation in the Sicilian Defense beginning with 1.e4 c5 2.Nf3 d6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 a6?"
  ],

  [
    "If a player moves their queen away from an attacked square, what important tactical opportunity should they check for before moving?",
    "What is the value of a bishop compared to a pawn in the traditional material point system?",
    "If two players have equal material but one has significantly more active pieces, which player generally has the positional advantage?",
    "White has a king on g1, queen on d1, and rook on e1. Black has a king on g8 and a rook on e8. What tactical possibility might White look for along the e-file?",
    "Why can calculating a forced sequence of checks, captures, and threats be more effective than simply choosing the move that looks strongest?"
  ],

  [
    "What is a zwischenzug?",
    "What is a deflection tactic?",
    "What is the difference between a decoy and a deflection?",
    "What is an interference tactic in chess?",
    "What is the name of the tactical pattern in which a queen and bishop cooperate to deliver checkmate on h7 or h2, often against a castled king?"
  ],

  [
    "Who was the first officially recognized World Chess Champion?",
    "Which chess player was nicknamed the 'Magician from Riga'?",
    "Which computer defeated Garry Kasparov in 1997?",
    "Who became the youngest undisputed World Chess Champion in 1985?",
    "Which chess player is famous for playing a legendary 13-move miniature against Donald Byrne in 1956?"
  ],

  [
    "What is the minimum number of moves without a pawn move or capture required for a player to claim a draw under the 50-move rule?",
    "Can two knights force checkmate against a lone king?",
    "What is the difference between a passed pawn and an isolated pawn?",
    "In a king and pawn endgame, what is the purpose of opposition?",
    "What is the theoretical result of king, bishop, and knight versus a lone king with correct play?"
  ]
];

const answers = [
  [
    "The Sicilian Defense",
    "2...e6 or 2...c6 are common responses; both are playable",
    "The Morphy Defense, Closed Variation of the Ruy Lopez",
    "...f5, challenging White's central structure and often preparing kingside play",
    "The Najdorf Variation"
  ],

  [
    "Whether moving the queen allows a discovered attack or exposes another valuable piece",
    "3 points",
    "The player with more active pieces",
    "A possible exchange or tactical sequence on the e-file, depending on the position",
    "Because forcing moves limit the opponent's choices and allow more accurate calculation"
  ],

  [
    "An intermediate move played before an expected recapture or response",
    "A tactic that forces an enemy piece away from an important defensive square",
    "A decoy lures a piece onto a particular square; a deflection drives a defending piece away from its duty",
    "A tactic in which a piece is placed between an enemy piece and an important square or line",
    "The Greek Gift is a related attacking sacrifice, but the specific queen-and-bishop mating pattern is commonly called a battery or mating attack"
  ],

  [
    "Wilhelm Steinitz",
    "Mikhail Tal",
    "IBM's Deep Blue",
    "Garry Kasparov",
    "Bobby Fischer"
  ],

  [
    "50 moves by each player, or 100 individual half-moves",
    "No. Two knights cannot force checkmate against a lone king with correct play",
    "A passed pawn has no opposing pawns able to stop or capture it on its path to promotion; an isolated pawn has no friendly pawns on adjacent files",
    "To restrict the opposing king's movement and gain control of key squares",
    "A forced checkmate, with correct play"
  ]
];

// ------------------------------------------
// Slide navigation
// ------------------------------------------

function goSlide(id) {
  document.querySelectorAll(".slide").forEach((slide) => {
    slide.classList.remove("active");
  });

  const target = document.getElementById(id);

  if (target) {
    target.classList.add("active");
  }

  updateMusicPlayerVisibility();
}

// ------------------------------------------
// Build Jeopardy board
// ------------------------------------------

const board = document.getElementById("jeopardy-board");

categories.forEach((category) => {
  const header = document.createElement("div");
  header.className = "category-cell";
  header.textContent = category;
  board.appendChild(header);
});

for (let row = 0; row < 5; row++) {
  const points = (row + 1) * 100;

  categories.forEach((category, column) => {
    const cell = document.createElement("button");

    cell.className = "jeopardy-cell";
    cell.textContent = points;

    cell.addEventListener("click", () => {
      showQuestion(column, row, cell);
    });

    board.appendChild(cell);
  });
}

// ------------------------------------------
// Question modal
// ------------------------------------------

function showQuestion(column, row, cell) {
  document.getElementById("modal-category").textContent = categories[column];
  document.getElementById("modal-points").textContent =
    `${(row + 1) * 100} Points`;

  document.getElementById("modal-question").textContent =
    questions[column][row];

  document.getElementById("modal-answer").textContent =
    `Answer: ${answers[column][row]}`;

  document.getElementById("modal-answer").classList.remove("show");
  document.getElementById("show-answer-btn").style.display = "inline-block";

  document.getElementById("question-modal").classList.add("show");

  startTimer("normal");

  // Mark the square as used.
  cell.classList.add("used");
}

function showAnswer() {
  document.getElementById("modal-answer").classList.add("show");
  document.getElementById("show-answer-btn").style.display = "none";
}

function closeModal() {

  clearInterval(timerInterval);

  timerInterval = null;

  timerPaused = false;

  document.getElementById("question-modal")
    .classList.remove("show");
}

// Allow Escape to close the question.
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeModal();
  }
});

// ==========================================
// REUSABLE TIMER
// ==========================================

let timerInterval = null;

// Default question timer: 3 minutes
const TIMER_DURATION = 45;
const DEFAULT_QUESTION_DURATION = 180;

let selectedQuestionDuration = DEFAULT_QUESTION_DURATION;
let currentTimerDuration = DEFAULT_QUESTION_DURATION;

let timerRemaining = DEFAULT_QUESTION_DURATION * 1000;

let timerPaused = false;
let activeTimerType = null;


// ------------------------------------------
// Start Timer
// ------------------------------------------

function startTimer(type = "normal") {

  clearInterval(timerInterval);

  activeTimerType = type;

  // Normal questions use the selected duration.
  // Final Jeopardy keeps its original 45 seconds.
  currentTimerDuration =
    type === "final"
      ? TIMER_DURATION
      : selectedQuestionDuration;

  timerRemaining = currentTimerDuration * 1000;

  timerPaused = false;

  updateTimerDisplay();
  updatePauseButton();

  timerInterval = setInterval(() => {

    if (timerPaused) return;

    timerRemaining -= 50;

    if (timerRemaining <= 0) {

      timerRemaining = 0;

      clearInterval(timerInterval);
      timerInterval = null;
    }

    updateTimerDisplay();

  }, 50);
}


// ------------------------------------------
// Select Question Timer Duration
// ------------------------------------------

function setTimerDuration(seconds) {

  selectedQuestionDuration = seconds;

  // Update selected button appearance
  document.querySelectorAll(
    "#question-modal .duration-button"
  ).forEach(button => {

    button.classList.remove("selected");

    const buttonText = button.textContent.trim();

    if (
      (seconds === 180 && buttonText === "3 Minutes") ||
      (seconds === 60 && buttonText === "1 Minute") ||
      (seconds === 30 && buttonText === "30 Seconds")
    ) {
      button.classList.add("selected");
    }

  });

  // Immediately reset and start the new duration
  startTimer("normal");
}


// ------------------------------------------
// Update Timer Display
// ------------------------------------------

function updateTimerDisplay() {

  const totalSeconds = Math.ceil(
    timerRemaining / 1000
  );

  let display;
  let bar;

  if (activeTimerType === "final") {

    display = document.getElementById(
      "final-timer-display"
    );

    bar = document.getElementById(
      "final-timer-bar"
    );

  } else {

    display = document.getElementById(
      "timer-display"
    );

    bar = document.getElementById(
      "timer-bar"
    );

  }

  if (!display || !bar) return;

  // Normal question timer uses MM:SS.
  // Final Jeopardy keeps its original seconds display.
  if (activeTimerType === "final") {

    display.textContent = totalSeconds;

  } else {

    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    display.textContent =
      `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  }

  const progress =
    timerRemaining /
    (currentTimerDuration * 1000);

  bar.style.transform = `scaleX(${progress})`;
}


// ------------------------------------------
// Pause / Resume
// ------------------------------------------

function toggleTimer() {

  if (timerRemaining <= 0) return;

  timerPaused = !timerPaused;

  updatePauseButton();
}


function updatePauseButton() {

  const buttonId =
    activeTimerType === "final"
      ? "final-timer-pause-btn"
      : "timer-pause-btn";

  const button = document.getElementById(buttonId);

  if (!button) return;

  button.textContent =
    timerPaused ? "Resume" : "Pause";
}


// ------------------------------------------
// Restart Timer
// ------------------------------------------

function restartTimer() {

  if (!activeTimerType) return;

  clearInterval(timerInterval);

  timerRemaining = currentTimerDuration * 1000;

  timerPaused = false;

  updateTimerDisplay();
  updatePauseButton();

  timerInterval = setInterval(() => {

    if (timerPaused) return;

    timerRemaining -= 50;

    if (timerRemaining <= 0) {

      timerRemaining = 0;

      clearInterval(timerInterval);
      timerInterval = null;
    }

    updateTimerDisplay();

  }, 50);
}

// ==========================================
// Final Jeopardy
// ==========================================

const finalJeopardy = {
  category: "Chess History",

  question: "Who was the first official World Chess Champion?",

  answer: "Wilhelm Steinitz"
};

function startFinalJeopardy() {

  // Fill in Final Jeopardy information
  document.getElementById("final-category").textContent =
    finalJeopardy.category;

  document.getElementById("final-question").textContent =
    finalJeopardy.question;

  document.getElementById("final-answer").textContent =
    `Answer: ${finalJeopardy.answer}`;

  // Hide the answer
  document.getElementById("final-answer").classList.remove("show");

  // Show the answer button
  document.getElementById("final-show-answer").style.display =
    "inline-block";

  // Go to Final Jeopardy
  goSlide("slide-final-jeopardy");

  // Start the 45-second timer
  startTimer("final");
}

function showFinalAnswer() {

  document.getElementById("final-answer").classList.add("show");

  document.getElementById("final-show-answer").style.display =
    "none";
}

function closeFinalJeopardy() {

  clearInterval(timerInterval);

  timerInterval = null;

  timerPaused = false;

  goSlide("slide-jeopardy");
}

// ==========================================
// BACKGROUND MUSIC PLAYER
// ==========================================

const backgroundMusic = document.getElementById("background-music");

const musicPlayButton = document.getElementById("music-play-btn");
const musicMuteButton = document.getElementById("music-mute-btn");
const musicVolumeSlider = document.getElementById("music-volume");
const musicStatus = document.getElementById("music-status");


// Initial settings

backgroundMusic.volume = 0.35;
backgroundMusic.loop = true;


// Play / Pause

musicPlayButton.addEventListener("click", async () => {

  if (backgroundMusic.paused) {

    try {

      await backgroundMusic.play();

    } catch (error) {

      console.error("Music could not be played:", error);

      musicStatus.textContent = "Unable to play";

    }

  } else {

    backgroundMusic.pause();

  }

});


// Update play button and status

function updateMusicDisplay() {

  if (backgroundMusic.paused) {

    musicPlayButton.textContent = "▶";

    musicPlayButton.setAttribute(
      "aria-label",
      "Play music"
    );

    musicStatus.textContent = "Paused";

  } else {

    musicPlayButton.textContent = "Ⅱ";

    musicPlayButton.setAttribute(
      "aria-label",
      "Pause music"
    );

    musicStatus.textContent = "Now Playing";

  }

}

backgroundMusic.addEventListener("play", updateMusicDisplay);
backgroundMusic.addEventListener("pause", updateMusicDisplay);


// Volume slider

musicVolumeSlider.addEventListener("input", () => {

  const volume = Number(musicVolumeSlider.value) / 100;

  backgroundMusic.volume = volume;

  if (volume > 0) {

    backgroundMusic.muted = false;

  }

  updateMuteDisplay();

});


// Mute / Unmute

musicMuteButton.addEventListener("click", () => {

  backgroundMusic.muted = !backgroundMusic.muted;

  updateMuteDisplay();

});


// Update mute button

function updateMuteDisplay() {

  if (backgroundMusic.muted || backgroundMusic.volume === 0) {

    musicMuteButton.innerHTML = "×";

    musicMuteButton.setAttribute(
      "aria-label",
      "Unmute music"
    );

  } else {

    musicMuteButton.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none"
           stroke="currentColor" stroke-width="2"
           stroke-linecap="round" stroke-linejoin="round">
        <path d="M11 5 6 9H2v6h4l5 4V5Z"/>
        <path d="M15.5 8.5a5 5 0 0 1 0 7"/>
        <path d="M19 5a10 10 0 0 1 0 14"/>
      </svg>
    `;

    musicMuteButton.setAttribute(
      "aria-label",
      "Mute music"
    );

  }

}

// ==========================================
// MUSIC PLAYER VISIBILITY
// ==========================================

function updateMusicPlayerVisibility() {

  const musicPlayer = document.querySelector(".music-player");
  const boardSlide = document.getElementById("slide-jeopardy");

  if (!musicPlayer || !boardSlide) return;

  musicPlayer.classList.toggle(
    "visible",
    boardSlide.classList.contains("active")
  );

}

// Set the correct visibility when the page first loads
updateMusicPlayerVisibility();
