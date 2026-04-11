export function renderLevelSelect(root, state) {
  const s = state.get();

  const h = document.createElement("h2");
  h.textContent = "Select Level";
  root.appendChild(h);

  const note = document.createElement("p");
  note.className = "shell-note";
  note.textContent = `Unlocked up to level ${s.unlockedLevel} of ${state.MAX_LEVEL}.`;
  root.appendChild(note);

  const grid = document.createElement("div");
  grid.className = "level-grid";
  for (let i = 1; i <= state.MAX_LEVEL; i++) {
    const card = document.createElement("button");
    card.className = "level-card";
    const locked = i > s.unlockedLevel;
    card.textContent = locked ? `Level ${i}\nLocked` : `Level ${i}`;
    card.disabled = locked;
    card.onclick = () => state.launchLevel(i);
    grid.appendChild(card);
  }
  root.appendChild(grid);
}
