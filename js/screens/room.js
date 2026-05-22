// ============================================================
// Room shell — common layout every room mounts into.
//   Layout: header / stage (the puzzle) / side panel (log + hints + input)
// A room module exports `mount(api)` and may call api.win() / api.lose() / api.log(...)
// ============================================================

import { el, TypingLog, toast, wait } from "../ui.js";
import { audio } from "../audio.js";

export function renderRoom(host, { room, nextRoom, onExit, onClear }) {
  const stage = el("div.room__stage");
  const flash = el("div.flash");
  stage.appendChild(flash);

  const logHost = el("div.log");
  const log = new TypingLog(logHost);

  const hintsHost = el("div.hints");
  const hints = (room.hints || []).map((h, i) => makeHint(h, i + 1, hintsHost));
  hints.forEach((node) => hintsHost.appendChild(node));

  const input = el("input.input.mono", {
    type: "text",
    inputMode: "numeric",
    autocomplete: "off",
    spellcheck: "false",
    placeholder: "VALUE _",
    "aria-label": "정답 입력",
  });

  const submitBtn = el("button.btn.btn--primary.btn--small", {
    onclick: submit,
  }, ["SUBMIT"]);

  let attempts = 0;
  function submit() {
    const raw = input.value.trim();
    if (!raw) {
      audio.error();
      input.classList.add("shake");
      setTimeout(() => input.classList.remove("shake"), 400);
      return;
    }
    attempts++;
    if (api.check(raw)) {
      api.win();
    } else {
      audio.error();
      input.classList.add("shake");
      flash.className = "flash fail show";
      log.push({ who: "FIREWALL", text: `REJECT // value=${raw} // signature mismatch`, tag: "error", delay: 80 });
      setTimeout(() => {
        input.classList.remove("shake");
        flash.className = "flash";
        input.select();
      }, 420);
      toast(`거부됨 // ${attempts}회 시도`, "err");
    }
  }
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") submit();
  });

  // ---- api the room module sees ----
  const api = {
    stage,             // DOM node where the puzzle should mount
    log: (line) => log.push(line),
    logMany: (lines) => log.pushMany(lines),
    toast,
    setInputPlaceholder: (p) => (input.placeholder = p),
    focusInput: () => input.focus(),
    check: (v) => false, // room overrides
    win: async () => {
      audio.success();
      flash.className = "flash show";
      log.push({ who: "SYS", text: "▷ signal accepted. synchronizing...", tag: "ok", delay: 200 });
      await wait(900);
      showSuccessOverlay(room, nextRoom, onClear);
    },
  };

  // Build the screen FIRST so the stage element lives in the document
  // before the room mounts. Room modules sometimes call
  // document.getElementById on counters they just appended — those lookups
  // only resolve once the screen is attached to <body>.
  const screen = el("section.screen.screen--room", {}, [
    el("div.room", {}, [
      el("header.room__header", {}, [
        el("div.room__crumb", {}, [
          "CHAPTER ",
          el("b", {}, [String(room.order).padStart(2, "0")]),
          "  //  ",
          room.tag || "",
        ]),
        el("h2.room__title", {}, [room.title]),
        el("div", { style: { display: "flex", gap: "8px" } }, [
          room.lesson
            ? el("button.btn.btn--ghost.btn--small", {
                onclick: () => { audio.click(); openLesson(room); },
                title: "수학 개념 설명",
              }, ["📐 CONCEPT"])
            : null,
          el("button.btn.btn--ghost.btn--small", {
            onclick: () => { audio.click(); onExit(); },
          }, ["EXIT"]),
        ]),
      ]),

      stage,

      el("aside.room__side", {}, [
        el("section.panel", {}, [
          el("h3.panel__title", {}, ["SYSTEM LOG"]),
          logHost,
        ]),
        el("section.panel", {}, [
          el("h3.panel__title", {}, ["HINT PROTOCOL"]),
          hintsHost,
        ]),
        el("section.panel.panel--input", {}, [
          el("h3.panel__title", {}, ["TRANSMIT ANSWER"]),
          el("div.input-row", {}, [input, submitBtn]),
        ]),
      ]),
    ]),
  ]);

  host.appendChild(screen);

  // Mount the room AFTER the screen is in the DOM so live element queries work.
  room.mount(api);

  setTimeout(() => input.focus({ preventScroll: true }), 380);
}

// ------------------------------------------------------------
// lesson modal — surfaces the math concept behind the room
// ------------------------------------------------------------
function openLesson(room) {
  const l = room.lesson;
  if (!l) return;

  const sections = (l.sections || []).map((s) => {
    const blocks = [];
    if (s.level) blocks.push(el("div.lesson__level.mono", {}, [`LEVEL ${s.level}`]));
    if (s.heading) blocks.push(el("h4.lesson__heading", {}, [s.heading]));
    if (s.body) blocks.push(el("p.lesson__body", { html: s.body }));
    if (s.formula) blocks.push(el("pre.lesson__formula.mono", {}, [s.formula]));
    if (s.note) blocks.push(el("div.lesson__note.mono", {}, [s.note]));
    return el(
      "section.lesson__section" + (s.level ? ` lesson__section--lv${s.level}` : ""),
      {},
      blocks
    );
  });

  const closeBtn = el("button.btn.btn--ghost.btn--small", {
    onclick: () => close(),
  }, ["CLOSE  (ESC)"]);

  const overlay = el("div.lesson-overlay", {
    onclick: (e) => { if (e.target === overlay) close(); },
  }, [
    el("div.lesson-card", {}, [
      el("div.lesson-card__head", {}, [
        el("div.lesson-card__tag.mono", {}, [`CONCEPT // CHAPTER ${String(room.order).padStart(2, "0")}`]),
        closeBtn,
      ]),
      el("h2.lesson-card__title", {}, [l.title || "Math Concept"]),
      el("div.lesson-card__body", {}, sections),
    ]),
  ]);
  document.body.appendChild(overlay);

  const onKey = (e) => { if (e.key === "Escape") close(); };
  window.addEventListener("keydown", onKey);

  function close() {
    audio.click();
    window.removeEventListener("keydown", onKey);
    overlay.remove();
  }
}

// ------------------------------------------------------------
// hint chip — click to reveal text
// ------------------------------------------------------------
function makeHint(hint, idx, host) {
  const label = el("span", {}, [hint.label || `HINT 0${idx}`]);
  const badge = el("span.badge", {}, ["TAP"]);
  const node = el("div.hint", {
    role: "button",
    tabIndex: "0",
    onclick: reveal,
    onkeydown: (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); reveal(); } },
  }, [label, badge]);

  function reveal() {
    if (node.classList.contains("revealed")) return;
    audio.step();
    node.classList.add("revealed");
    badge.textContent = String(idx).padStart(2, "0");
    label.textContent = hint.text;
  }
  return node;
}

// ------------------------------------------------------------
// success overlay — celebratory full-screen panel.
// If a next room exists, auto-advance after a short countdown
// (or user can skip the wait by clicking).
// ------------------------------------------------------------
function showSuccessOverlay(room, nextRoom, onClear) {
  const hasNext = !!nextRoom;
  const ctaLabel = hasNext
    ? `▶  ENTER  CHAPTER ${String(nextRoom.order).padStart(2, "0")}`
    : "RETURN TO INDEX  →";
  const subText = hasNext
    ? `다음 챕터를 잠금 해제했습니다 — ${nextRoom.title}`
    : (room.successLine || "다음 노드로 동기화합니다.");

  const countdownEl = el("div.success-overlay__count.mono", {});
  const ctaBtn = el("button.btn.btn--primary", {
    onclick: () => done(),
  }, [ctaLabel]);

  const overlay = el("div.success-overlay", {}, [
    el("div.success-overlay__inner", {}, [
      el("div.success-overlay__tag", {}, ["// BREACH ACKNOWLEDGED"]),
      el("h2.success-overlay__title", {}, [`CHAPTER ${String(room.order).padStart(2, "0")} CLEARED`]),
      el("div.success-overlay__sub", {}, [subText]),
      el("div.success-overlay__sync", {}, [el("span"), el("span"), el("span"), el("span"), el("span")]),
      ctaBtn,
      hasNext ? countdownEl : null,
    ]),
  ]);
  document.body.appendChild(overlay);

  let triggered = false;
  function done() {
    if (triggered) return;
    triggered = true;
    audio.click();
    clearInterval(timer);
    overlay.remove();
    onClear();
  }

  // 4-second auto-advance when there's a next chapter
  let timer = null;
  if (hasNext) {
    let remaining = 4;
    countdownEl.textContent = `AUTO-SYNC IN ${remaining}s  · click to skip`;
    timer = setInterval(() => {
      remaining--;
      if (remaining <= 0) { done(); return; }
      countdownEl.textContent = `AUTO-SYNC IN ${remaining}s  · click to skip`;
    }, 1000);
  }
}
