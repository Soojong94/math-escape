// ============================================================
// Chapter select — grid of rooms (locked / unlocked / cleared).
// Unlock rule: room N+1 unlocks after clearing N.
// ============================================================

import { el } from "../ui.js";
import { audio } from "../audio.js";

export function renderChapters(host, { rooms, cleared, onSelect, onBack, onReset }) {
  const cards = rooms.map((room, i) => {
    const isCleared = cleared.has(room.id);
    const isUnlocked = i === 0 || cleared.has(rooms[i - 1].id);

    let statusText = "READY";
    if (isCleared) statusText = "CLEARED";
    else if (!isUnlocked) statusText = "ENCRYPTED";
    else if (!room.implemented) statusText = "COMING SOON";

    return el(
      "button.chapter-card" + (isCleared ? ".cleared" : "") + (!isUnlocked || !room.implemented ? ".locked" : ""),
      {
        onclick: () => {
          if (!isUnlocked) return audio.error();
          if (!room.implemented) return audio.error();
          audio.click();
          onSelect(room.id);
        },
        onmouseenter: () => isUnlocked && room.implemented && audio.hover(),
      },
      [
        el("div", {}, [
          el("div.chapter-card__id", {}, [String(i + 1).padStart(2, "0") + " // CHAPTER"]),
          el("div.chapter-card__name", {}, [room.title]),
          el("div.chapter-card__concept", {}, [room.concept]),
        ]),
        el("div.chapter-card__foot", {}, [
          el("span.chapter-card__status", {}, [statusText]),
          el("span", {}, [room.tag || ""]),
        ]),
      ]
    );
  });

  const clearedCount = rooms.filter((r) => cleared.has(r.id)).length;

  const screen = el("section.screen", {}, [
    el("div.chapters", {}, [
      el("header.chapters__head", {}, [
        el("div.chapters__title", {}, [
          "INDEX // CHAPTERS",
          el("strong", {}, ["수학 개념의 방들"]),
        ]),
        el("div.chapters__progress", {}, [
          "BREACH PROGRESS  ",
          el("span", {}, [`${clearedCount} / ${rooms.length}`]),
        ]),
      ]),
      el("div.chapters__grid", {}, cards),
      el("div", { style: { marginTop: "36px", textAlign: "center", display: "flex", gap: "10px", justifyContent: "center" } }, [
        el("button.btn.btn--ghost.btn--small", {
          onclick: () => { audio.click(); onBack(); },
        }, ["← BACK"]),
        clearedCount > 0 && onReset
          ? el("button.btn.btn--ghost.btn--small", {
              onclick: () => {
                if (!confirm("저장된 진행 상황을 모두 초기화할까요?")) return;
                audio.click();
                onReset();
              },
              title: "localStorage에 저장된 클리어 기록을 모두 지움",
            }, ["RESET PROGRESS"])
          : null,
      ]),
    ]),
  ]);

  host.appendChild(screen);
}
