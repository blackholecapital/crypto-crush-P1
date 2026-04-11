export function renderResult(root, state) {
  const s = state.get();
  const r = s.lastResult;

  const h = document.createElement("h2");
  h.textContent = "Result";
  root.appendChild(h);

  if (!r) {
    const msg = document.createElement("p");
    msg.textContent = "No result payload.";
    root.appendChild(msg);
  } else {
    const headline = document.createElement("p");
    headline.textContent = `Outcome: ${r.outcome} — Score: ${r.score}`;
    root.appendChild(headline);

    const pre = document.createElement("pre");
    pre.textContent =
      "WA exit payload (accepted):\n" + JSON.stringify(r, null, 2);
    root.appendChild(pre);
  }

  const actions = document.createElement("div");
  actions.className = "actions";

  const primary = document.createElement("button");
  if (r && r.outcome === "win" && r.nextRoute === "next_level") {
    primary.textContent = "Continue → Next Level";
  } else if (r && r.outcome === "fail" && r.nextRoute === "retry") {
    primary.textContent = "Retry Level";
  } else {
    primary.textContent = "Return to Level Select";
  }
  primary.onclick = () => state.routeFromResult();
  actions.appendChild(primary);

  // Direct return to level_select is always available.
  const ls = document.createElement("button");
  ls.textContent = "Level Select";
  ls.onclick = () => state.goLevelSelect();
  actions.appendChild(ls);

  root.appendChild(actions);
}
