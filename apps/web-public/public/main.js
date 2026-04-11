// Crypto Crush | public shell entry
// Mounts shell flow at /. No text-only placeholder.

import { createShellState } from "./shell/state.js";
import { render } from "./shell/router.js";

const root = document.getElementById("app");
const state = createShellState();

state.subscribe(() => render(root, state));
render(root, state);
