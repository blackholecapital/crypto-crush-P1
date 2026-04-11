import { renderSplash } from "./splash.js";
import { renderLevelSelect } from "./level-select.js";
import { renderGameHost } from "./game-host.js";
import { renderResult } from "./result.js";

export function render(root, state) {
  const s = state.get();
  root.innerHTML = "";
  const wrap = document.createElement("div");
  wrap.className = "shell-container";

  switch (s.currentScreen) {
    case "splash":
      renderSplash(wrap, state);
      break;
    case "level_select":
      renderLevelSelect(wrap, state);
      break;
    case "game":
      renderGameHost(wrap, state);
      break;
    case "result":
      renderResult(wrap, state);
      break;
    default: {
      const msg = document.createElement("p");
      msg.textContent = "unknown screen";
      wrap.appendChild(msg);
    }
  }

  root.appendChild(wrap);
}
