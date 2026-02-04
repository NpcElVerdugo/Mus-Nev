const NOTES = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];

const menuBtn = document.getElementById("menuBtn");
const sidebar = document.getElementById("sidebar");
menuBtn.onclick = () => sidebar.classList.toggle("active");

let activeSong = null;
let originalKey = "C";
let transposeSteps = 0;
const addedSongsContainer = document.getElementById("addedSongs");

const currentKeyLabel = document.getElementById("currentKey");
const noteSelector = document.getElementById("noteSelector");
const capoSelector = document.getElementById("capoSelector");

// Sidebar close
document.addEventListener("click", (e) => {
  if (!sidebar.contains(e.target) && !menuBtn.contains(e.target)) {
    sidebar.classList.remove("active");
  }
});

// Botones transposición
document.getElementById("upHalf").onclick = () => changeTranspose(1);
document.getElementById("downHalf").onclick = () => changeTranspose(-1);
document.getElementById("upKey").onclick = () => changeTranspose(2);
document.getElementById("downKey").onclick = () => changeTranspose(-2);

function changeTranspose(step){
  transposeSteps += step;
  updateSong();
}

noteSelector.onchange = () => {
  if (!activeSong) return;
  const targetNote = noteSelector.value;
  const currentIndex = NOTES.indexOf(originalKey);
  const targetIndex = NOTES.indexOf(targetNote);
  transposeSteps = targetIndex - currentIndex;
  updateSong();
};

capoSelector.onchange = () => updateSong();

// Acordeón categorías
document.querySelectorAll(".genre-btn").forEach(btn => {
  btn.onclick = () => {
    const songsDiv = btn.nextElementSibling;
    songsDiv.style.display = songsDiv.style.display === "block" ? "none" : "block";
  };
});

// Acordeón canciones
document.querySelectorAll(".song-btn").forEach(btn => {
  btn.onclick = () => {
    const content = btn.nextElementSibling;
    const isOpen = content.style.display === "block";

    // cerrar todas
    document.querySelectorAll(".song-content").forEach(sc => {
      sc.style.display = "none";
    });

    // si estaba cerrada → abrir
    if (!isOpen) {
      content.style.display = "block";
      activeSong = content.querySelector(".chord-sheet");

      transposeSteps = 0;
      originalKey = btn.dataset.originalKey || "C";
      document.getElementById("originalKey").textContent = originalKey;
      noteSelector.value = originalKey;
      capoSelector.value = 0;

      updateSong();
    } else {
      // si estaba abierta → cerrar
      activeSong = null;
    }
  };
});

// Función de transposición
function updateSong(){
  if (!activeSong) return;

  const capo = parseInt(capoSelector.value) || 0;
  const totalStep = transposeSteps + capo;

  const originalText = activeSong.dataset.original || activeSong.innerHTML;
  activeSong.dataset.original = originalText;

  activeSong.innerHTML = transposeText(originalText, totalStep);

  const currentIndex = (NOTES.indexOf(originalKey) + totalStep + 12) % 12;
  currentKeyLabel.textContent = NOTES[currentIndex];
}

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

// Agregar canción
document.querySelectorAll(".addSongBtn").forEach(btn => {
  btn.onclick = () => {
    if (!activeSong) return;

    const songDiv = document.createElement("div");
    songDiv.classList.add("added-song");

    const songButton = activeSong.closest(".song-content").previousElementSibling;
    const songName = document.createElement("p");
    songName.textContent = songButton ? songButton.textContent : "Canción";
    songName.style.fontWeight = "bold";
    songDiv.appendChild(songName);

    const cloned = document.createElement("pre");
    cloned.classList.add("chord-sheet");
    cloned.innerHTML = activeSong.innerHTML;
    songDiv.appendChild(cloned);

    addedSongsContainer.appendChild(songDiv);
  };
});

// Popup acorde
const popup = document.createElement("div");
popup.classList.add("chord-popup");
document.body.appendChild(popup);

document.addEventListener("click", e => {
  if (e.target.tagName === "A") {
    e.preventDefault();
    const chord = e.target.textContent.trim();
    popup.style.backgroundImage = `url('acordes/${chord}.png')`;
    const rect = e.target.getBoundingClientRect();
    popup.style.top = `${rect.bottom + window.scrollY + 5}px`;
    popup.style.left = `${rect.left + window.scrollX}px`;
    popup.style.display = "block";
  } else {
    popup.style.display = "none";
  }
});

// Limpiar canciones agregadas
document.getElementById("clearSongsBtn").onclick = () => {
  addedSongsContainer.innerHTML = "";
};

// Fullscreen
document.getElementById("fullscreenBtn").onclick = () => {
  if (!document.fullscreenElement) document.documentElement.requestFullscreen();
  else document.exitFullscreen();
};
