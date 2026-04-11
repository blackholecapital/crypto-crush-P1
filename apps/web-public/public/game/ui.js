// Crypto Crush — public surface views.
import { LEVELS, getLevel } from "./levels.js";
import { TOKEN_DISPLAY, getMaxUnlocked } from "./contract.js";
import { W, H } from "./engine.js";

export function renderSplash(root, dispatch) {
  root.innerHTML = `
    <div class="screen splash">
      <h1>Crypto Crush</h1>
      <p class="tag">Match. Cascade. Crush.</p>
      <button class="btn primary" data-act="play">Play</button>
    </div>
  `;
  root.querySelector("[data-act=play]").addEventListener("click", () => dispatch({ type: "GO_LEVEL_SELECT" }));
}

export function renderLevelSelect(root, dispatch) {
  const maxUnlocked = getMaxUnlocked();
  const cards = LEVELS.map((l) => {
    const unlocked = l.levelId <= maxUnlocked;
    const goalText = Object.entries(l.goals)
      .map(([id, n]) => `${n} ${TOKEN_DISPLAY[id].label}`)
      .join(" · ");
    return `
      <button class="level-card ${unlocked ? "unlocked" : "locked"}" data-lv="${l.levelId}" ${unlocked ? "" : "disabled"}>
        <span class="lv-num">${l.levelId}</span>
        <span class="lv-label">${l.label}</span>
        <span class="lv-goal">${goalText}</span>
        <span class="lv-meta">${unlocked ? "Play" : "Locked"}</span>
      </button>
    `;
  }).join("");
  root.innerHTML = `
    <div class="screen level-select">
      <header class="topbar">
        <button class="btn ghost" data-act="back">&lt; Back</button>
        <h2>Select Level</h2>
        <span class="spacer"></span>
      </header>
      <div class="level-grid">${cards}</div>
    </div>
  `;
  root.querySelector("[data-act=back]").addEventListener("click", () => dispatch({ type: "GO_SPLASH" }));
  root.querySelectorAll(".level-card.unlocked").forEach((el) => {
    el.addEventListener("click", () => dispatch({ type: "LAUNCH_LEVEL", levelId: Number(el.dataset.lv) }));
  });
}

export function renderGame(root, game, dispatch) {
  const lv = getLevel(game.levelId);
  const goalHtml = Object.entries(lv.goals)
    .map(([id, target]) => {
      const rem = game.goals[id] ?? 0;
      const cur = target - rem;
      const td = TOKEN_DISPLAY[id];
      return `<span class="goal-item"><span class="goal-dot" style="background:${td.color}"></span>${td.label} ${cur}/${target}</span>`;
    })
    .join("");

  const cells = [];
  for (let r = 0; r < H; r++) {
    for (let c = 0; c < W; c++) {
      const id = game.board[r][c];
      const td = id ? TOKEN_DISPLAY[id] : null;
      const sel = game.selected && game.selected[0] === r && game.selected[1] === c ? "sel" : "";
      cells.push(
        `<div class="cell ${sel}" data-r="${r}" data-c="${c}" style="${td ? `background:${td.color}` : ""}">${td ? td.label : ""}</div>`
      );
    }
  }

  const overlay = game.paused
    ? `
      <div class="overlay">
        <div class="pause-menu">
          <h3>Paused</h3>
          <button class="btn primary" data-act="resume">Resume</button>
          <button class="btn" data-act="retry">Retry</button>
          <button class="btn ghost" data-act="quit">Quit</button>
        </div>
      </div>`
    : "";

  root.innerHTML = `
    <div class="screen game">
      <header class="topbar">
        <span class="spacer"></span>
        <h2>${lv.label}</h2>
        <button class="btn ghost" data-act="pause">Pause</button>
      </header>
      <div class="hud">
        <div class="goals">${goalHtml}</div>
        <div class="stats">
          <div><label>SCORE</label><span>${game.score.toString().padStart(6, "0")}</span></div>
          <div><label>MOVES</label><span>${game.movesRemaining}</span></div>
        </div>
      </div>
      <div class="board">${cells.join("")}</div>
      <div class="booster-tray">
        <div class="slot">—</div><div class="slot">—</div><div class="slot">—</div>
      </div>
      ${overlay}
    </div>
  `;

  root.querySelector("[data-act=pause]").addEventListener("click", () => dispatch({ type: "PAUSE" }));
  if (game.paused) {
    root.querySelector("[data-act=resume]").addEventListener("click", () => dispatch({ type: "RESUME" }));
    root.querySelector("[data-act=retry]").addEventListener("click", () => dispatch({ type: "RETRY" }));
    root.querySelector("[data-act=quit]").addEventListener("click", () => dispatch({ type: "QUIT" }));
  }
  root.querySelectorAll(".cell").forEach((el) => {
    el.addEventListener("click", () =>
      dispatch({ type: "CELL_TAP", r: Number(el.dataset.r), c: Number(el.dataset.c) })
    );
  });
}

export function renderResult(root, exit, dispatch) {
  const label =
    exit.outcome === "win" ? "You Win" : exit.outcome === "fail" ? "Out of Moves" : "Left Level";
  const showNext = exit.outcome === "win" && exit.levelId < 5;
  const showRetry = exit.outcome === "fail";
  root.innerHTML = `
    <div class="screen result">
      <h2>${label}</h2>
      <div class="result-stats">
        <div><label>SCORE</label><span>${exit.score}</span></div>
        <div><label>MOVES USED</label><span>${exit.movesUsed}</span></div>
        <div><label>MOVES LEFT</label><span>${exit.movesRemaining}</span></div>
      </div>
      <div class="actions">
        ${showNext ? `<button class="btn primary" data-act="next">Next Level</button>` : ""}
        ${showRetry ? `<button class="btn primary" data-act="retry">Retry</button>` : ""}
        <button class="btn" data-act="select">Level Select</button>
      </div>
    </div>
  `;
  const wire = (sel, type) => {
    const el = root.querySelector(sel);
    if (el) el.addEventListener("click", () => dispatch({ type }));
  };
  wire("[data-act=next]", "NEXT_LEVEL");
  wire("[data-act=retry]", "RETRY");
  wire("[data-act=select]", "GO_LEVEL_SELECT");
}
