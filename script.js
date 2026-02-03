const NOTES = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];

const menuBtn = document.getElementById("menuBtn");
const sidebar = document.getElementById("sidebar");
menuBtn.onclick = () => sidebar.classList.toggle("active");

let activeSong = null;        // referencia a canción abierta
let originalKey = "C";        // nota original de la canción
let transposeSteps = 0;       // pasos según selector o botones
const addedSongsContainer = document.getElementById("addedSongs");

const currentKeyLabel = document.getElementById("currentKey");
const noteSelector = document.getElementById("noteSelector");
const capoSelector = document.getElementById("capoSelector");
document.addEventListener("click", (e) => {
  const clickedInsideSidebar = sidebar.contains(e.target);
  const clickedMenuBtn = menuBtn.contains(e.target);

  if (!clickedInsideSidebar && !clickedMenuBtn) {
    sidebar.classList.remove("active");
  }
});


// ====================
// BOTONES SUBIR/BAJAR
// ====================
document.getElementById("upHalf").onclick = () => changeTranspose(1);   // medio tono = 1 semitono
document.getElementById("downHalf").onclick = () => changeTranspose(-1);

document.getElementById("upKey").onclick = () => changeTranspose(2);    // 1 tono = 2 semitonos
document.getElementById("downKey").onclick = () => changeTranspose(-2);


function changeTranspose(step){
  transposeSteps += step;
  updateSong();
}

// ====================
// SELECTOR NOTA
// ====================
noteSelector.onchange = () => {
  if (!activeSong) return;
  const targetNote = noteSelector.value;
  const currentIndex = NOTES.indexOf(originalKey);
  const targetIndex = NOTES.indexOf(targetNote);
  transposeSteps = targetIndex - currentIndex;
  updateSong();
};

// ====================
// SELECTOR CAPO
// ====================
capoSelector.onchange = () => updateSong();

// ====================
// ACORDEÓN CATEGORÍAS
// ====================
document.querySelectorAll(".genre-btn").forEach(btn => {
  btn.onclick = () => {
    const songsDiv = btn.nextElementSibling;
    songsDiv.style.display = songsDiv.style.display === "block" ? "none" : "block";
  };
});

// ====================
// ACORDEÓN CANCIONES
// ====================
document.querySelectorAll(".song-btn").forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll(".song-content").forEach(sc => sc.style.display = "none");

    const content = btn.nextElementSibling;
    content.style.display = "block";
    activeSong = content.querySelector(".chord-sheet");

    transposeSteps = 0;

    // Nota original desde el botón
    originalKey = btn.dataset.originalKey || "C";
    document.getElementById("originalKey").textContent = originalKey;
    noteSelector.value = originalKey;
    capoSelector.value = 0;

    updateSong();
  };
});

// ====================
// FUNCIONES DE TRANSPOSICIÓN
// ====================
function updateSong(){
  if (!activeSong) return;

  const capo = parseInt(capoSelector.value) || 0;
  const totalStep = transposeSteps + capo;

  const originalText = activeSong.dataset.original || activeSong.textContent;
  activeSong.dataset.original = originalText;

  activeSong.textContent = transposeText(originalText, totalStep);

  // Nota actual
  const currentIndex = (NOTES.indexOf(originalKey) + totalStep + 12) % 12;
  currentKeyLabel.textContent = NOTES[currentIndex];
}

// ====================
// TRANSPONER ACORDES
// ====================
function transposeText(text, step){
  return text.replace(/\b([A-G])(#{0,1}|b{0,1})(m|maj|min|dim|aug)?(7)?\b/g,
    chord => transposeChord(chord, step)
  );
}

function transposeChord(chord, step){
  const match = chord.match(/^([A-G])(#{0,1}|b{0,1})(.*)$/);
  if (!match) return chord;

  let [, note, accidental, suffix] = match;
  let baseNote = note + accidental;

  let index = NOTES.indexOf(baseNote.replace("b","#"));
  if (index === -1) return chord;

  let newIndex = (index + step + 12) % 12;
  return NOTES[newIndex] + suffix;
}

// ====================
// AGREGAR CANCIÓN
// ====================
document.querySelectorAll(".addSongBtn").forEach(btn => {
  btn.onclick = () => {
    if (!activeSong) return;

    const songDiv = document.createElement("div");
    songDiv.classList.add("added-song");

    const songName = document.createElement("p");
    songName.textContent =
      btn.closest(".songs")
         .querySelector(".song-btn:focus")?.textContent || "Canción";
    songName.style.fontWeight = "bold";
    songDiv.appendChild(songName);

    const keyInfo = document.createElement("p");
 
    songDiv.appendChild(keyInfo);

    const cloned = document.createElement("pre");
    cloned.classList.add("chord-sheet");
    cloned.textContent = activeSong.textContent;

    songDiv.appendChild(cloned);
    addedSongsContainer.appendChild(songDiv);
  };
});

// ====================
// BARRA DE BÚSQUEDA
// ====================
document.querySelector(".search").addEventListener("input", function(){
  const term = this.value.toLowerCase();
  document.querySelectorAll(".genre-section").forEach(section => {
    let anyMatch = false;

    section.querySelectorAll(".song-btn").forEach(songBtn => {
      const match = songBtn.textContent.toLowerCase().includes(term);
      songBtn.style.display = match ? "block" : "none";
      if(match) anyMatch = true;
    });

    section.style.display = anyMatch ? "block" : "none";
  });
});


// ====================
// BORRAR CANCIÓN
// ====================
document.getElementById("clearSongsBtn").onclick = () => {
  addedSongsContainer.innerHTML = "";
};


const fullscreenBtn = document.getElementById("fullscreenBtn");

fullscreenBtn.onclick = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
};


