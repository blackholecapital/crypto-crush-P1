export function renderSplash(root, state) {
  const s = state.get();

  const h = document.createElement("h1");
  h.textContent = "Crypto Crush";
  root.appendChild(h);

  const p = document.createElement("p");
  p.textContent = `Welcome, ${s.username}`;
  root.appendChild(p);

  const play = document.createElement("button");
  play.textContent = "Play";
  play.onclick = () => state.goLevelSelect();
  root.appendChild(play);
}
