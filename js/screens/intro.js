// ============================================================
// Intro screen — title, world-building blurb, START button.
// ============================================================

import { el } from "../ui.js";
import { audio } from "../audio.js";

export function renderIntro(host, { onStart }) {
  const screen = el("section.screen", {}, [
    el("div.intro", {}, [
      el("div.intro__brand.mono", {}, ["ESCAPE // MATH SYSTEM v0.1"]),
      el("h1.intro__title", { html:
        `ESCAPE<span class="slash">::</span><span class="sys">MATH</span>` }),
      el("p.intro__lede", {}, [
        "수학의 규칙이 곧 ",
        el("strong", {}, ["세계의 물리"]),
        "다. ",
        "조합, 대칭, 모듈러, 그래프 — 각 챕터는 하나의 수학 개념을 공간으로 번역한 ",
        el("strong", {}, ["방"]),
        "이다. 문제를 풀지 말고, ",
        el("strong", {}, ["규칙을 발견"]),
        "해라.",
      ]),
      el("div.intro__cta", {}, [
        el("button.btn.btn--primary", {
          onclick: () => { audio.click(); onStart(); },
        }, ["▶  ENTER  SYSTEM"]),
        el("div.intro__hint", {}, ["[ENTER] · [SPACE] · [CLICK]"]),
      ]),
      el("div.intro__meta", {}, [
        el("span", {}, ["NODE://terminal-7"]),
        el("span.blink", {}, ["AWAITING OPERATOR"]),
        el("span", {}, ["MODE: TRAINING"]),
      ]),
    ]),
  ]);
  host.appendChild(screen);

  const onKey = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      audio.click();
      window.removeEventListener("keydown", onKey);
      onStart();
    }
  };
  window.addEventListener("keydown", onKey);
}
