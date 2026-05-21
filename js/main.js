// ============================================================
// ESCAPE // MATH SYSTEM — entry point
// Boots the app, wires global state, and handles screen routing.
// ============================================================

import { startBackground } from "./bg.js";
import { audio } from "./audio.js";
import { renderIntro } from "./screens/intro.js";
import { renderChapters } from "./screens/chapters.js";
import { renderRoom } from "./screens/room.js";
import { rooms } from "./rooms/index.js";

const app = document.getElementById("app");

const state = {
  cleared: new Set(JSON.parse(localStorage.getItem("escape:cleared") || "[]")),
  current: null,
};

function persist() {
  localStorage.setItem("escape:cleared", JSON.stringify([...state.cleared]));
}

// ------------------------------------------------------------
// router — controls which screen is mounted.
// adding a new screen = add a case below.
// ------------------------------------------------------------

async function go(route) {
  state.current = route;

  // outgoing transition
  const prev = app.firstElementChild;
  if (prev) {
    prev.classList.add("fade-out");
    await wait(300);
    prev.remove();
  }

  switch (route.name) {
    case "intro":
      renderIntro(app, { onStart: () => go({ name: "chapters" }) });
      break;
    case "chapters":
      renderChapters(app, {
        rooms,
        cleared: state.cleared,
        onSelect: (roomId) => go({ name: "room", roomId }),
        onBack: () => go({ name: "intro" }),
      });
      break;
    case "room": {
      const room = rooms.find((r) => r.id === route.roomId);
      if (!room) return go({ name: "chapters" });
      const idx = rooms.indexOf(room);
      const next = rooms[idx + 1];
      const nextPlayable = next && next.implemented ? next : null;
      renderRoom(app, {
        room,
        nextRoom: nextPlayable,
        onExit: () => go({ name: "chapters" }),
        onClear: () => {
          state.cleared.add(room.id);
          persist();
          if (nextPlayable) go({ name: "room", roomId: nextPlayable.id });
          else go({ name: "chapters" });
        },
      });
      break;
    }
  }
}

function wait(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// ------------------------------------------------------------
// boot
// ------------------------------------------------------------

startBackground(document.getElementById("bg-canvas"));

// First user interaction enables audio (browser autoplay policy).
const enableAudio = () => {
  audio.enable();
  window.removeEventListener("pointerdown", enableAudio);
  window.removeEventListener("keydown", enableAudio);
};
window.addEventListener("pointerdown", enableAudio);
window.addEventListener("keydown", enableAudio);

go({ name: "intro" });
