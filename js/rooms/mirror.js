// ============================================================
// Mirror Chamber — Sieve of Eratosthenes + twin primes
// ------------------------------------------------------------
// Concept   : 거울은 모든 합성을 반사한다. 1..100 격자에서 소수만 살아남는다.
// Rule      : 수 n 을 클릭하면 n 의 배수가 합성수로 마킹된다.
// Insight   : 100 이하의 합성수는 √100 = 10 이하의 소수 (2,3,5,7) 의 배수.
//             채를 다 돌리면 25 개의 소수가 남는다.
// Question  : 100 이하의 *쌍둥이 소수* 쌍 (p, p+2) 의 개수는?
// Answer    : 8  ←  (3,5)(5,7)(11,13)(17,19)(29,31)(41,43)(59,61)(71,73)
// ============================================================

import { el } from "../ui.js";
import { audio } from "../audio.js";

const N_MAX = 100;
const TWIN_PAIRS = [
  [3, 5], [5, 7], [11, 13], [17, 19],
  [29, 31], [41, 43], [59, 61], [71, 73],
];
const ANSWER = TWIN_PAIRS.length; // 8

function isPrime(n) {
  if (n < 2) return false;
  for (let i = 2; i * i <= n; i++) if (n % i === 0) return false;
  return true;
}

export const mirror = {
  id: "mirror-room",
  order: 2,
  title: "MIRROR CHAMBER",
  tag: "정수론 // 에라토스테네스의 채 // 쌍둥이 소수",
  concept: "거울이 합성을 반사한다 — 소수만 살아남는 격자. 쌍둥이 소수 짝의 수를 세라.",
  implemented: true,
  successLine: "쌍둥이 소수가 봉인되었습니다. 시간의 신전으로 진입합니다.",

  hints: [
    {
      label: "▸ HINT 01 — 채의 규칙",
      text: "한 수를 누르면 그 수의 *배수가* 합성수로 마킹된다 (자신 제외). 2, 3, 5, 7 부터 시작.",
    },
    {
      label: "▸ HINT 02 — √100",
      text: "100 이하의 합성수는 √100 = 10 이하의 소수 (2, 3, 5, 7) 의 배수. 그 외는 모두 소수.",
    },
    {
      label: "▸ HINT 03 — 쌍둥이 소수의 정의",
      text: "쌍둥이 소수란 차이가 정확히 2인 두 소수 (p, p+2). 채를 돌린 뒤 격자에서 연속한 두 소수 짝을 세라.",
    },
    {
      label: "▸ HINT 04 — 7대 난제와의 연관",
      text: "쌍둥이 소수가 무한히 존재하는가? — 풀리지 않은 100년 가설. 100 이하에선 직접 셀 수 있다.",
    },
  ],

  lesson: {
    title: "에라토스테네스의 채 · 쌍둥이 소수",
    sections: [
      {
        heading: "소수란",
        body: "1 과 자기 자신 외의 약수를 가지지 않는 1 보다 큰 자연수. (예: 2, 3, 5, 7, 11, …)",
      },
      {
        heading: "에라토스테네스의 채 (BC 200 경)",
        body: "2 부터 N 까지 나열한 후, 작은 소수부터 차례로 그 *배수*를 모두 지운다. " +
              "지워지지 않고 남은 수가 소수.",
        formula: "복잡도 O(N log log N)  ·  √N 이하의 소수까지만 처리하면 충분",
      },
      {
        heading: "효율의 핵심",
        body: "1 부터 N 까지의 합성수는 모두 √N 이하의 어떤 소수의 배수. " +
              "따라서 √N 이하의 소수만 \"씨앗\"으로 처리하면 충분.",
      },
      {
        heading: "쌍둥이 소수",
        body: "두 소수 p, q 에 대해 q − p = 2 일 때 쌍 (p, q) 를 쌍둥이 소수라 한다. " +
              "예: (3, 5), (11, 13), (17, 19), …",
      },
      {
        heading: "쌍둥이 소수 무한 가설",
        body: "쌍둥이 소수가 무한히 존재하는가? — 200 년 넘게 *미해결*. " +
              "2013 년 장이탕 (Zhang) 이 \"7천만 이하의 갭 소수쌍은 무한히 많다\" 를 증명한 후 " +
              "Polymath 프로젝트로 갭이 246 까지 좁혀졌다.",
        note: "쌍둥이 소수 (gap = 2) 의 무한성은 여전히 열린 문제.",
      },
    ],
  },

  // ----------------------------------------------------------
  mount(api) {
    const composite = new Set([1]); // 1 은 처음부터 제외
    const cells = []; // index: n-1

    const meta = el("div.firewall__meta", {}, [
      el("span", {}, ["SIEVE OF ERATOSTHENES  //  1 … 100"]),
      el("span", {}, [
        "PRIMES FOUND  ",
        el("b", { id: "mr-primes" }, ["00"]),
      ]),
    ]);

    const grid = el("div.sieve-grid");
    for (let n = 1; n <= N_MAX; n++) {
      const btn = el("button.sieve-cell", {
        "data-n": n,
        onclick: () => onClick(n),
        onmouseenter: () => audio.hover(),
      }, [String(n)]);
      cells.push(btn);
      grid.appendChild(btn);
    }

    const resetBtn = el("button.btn.btn--ghost.btn--small", { onclick: reset }, ["RESET"]);

    const stage = el("div.firewall", {}, [
      meta,
      grid,
      el("div.firewall__controls", {}, [resetBtn]),
      el("div.mirror__legend.mono", {}, [
        el("span", {}, ["click → mark multiples"]),
        el("span.accent", {}, ["■ prime"]),
        el("span.dim", {}, ["✕ composite"]),
      ]),
    ]);
    api.stage.appendChild(stage);

    api.logMany([
      { who: "SYS", text: "거울방 격자 — 1 부터 100 까지. 합성은 거울에 반사되어 사라진다.", tag: "system" },
      { who: "OBSERVER", text: "한 수를 누르면 그 수의 *배수*가 마킹된다 (자신 제외).", tag: "warn" },
      { who: "OBSERVER", text: "에라토스테네스의 채로 소수를 남기고, *쌍둥이 소수* 짝의 수를 입력해라.", tag: "warn" },
    ]);
    api.setInputPlaceholder("TWIN PAIRS _");

    // ----------------------------------------------------------
    function onClick(n) {
      audio.step();
      if (n === 1) {
        api.toast("1 은 소수도 합성수도 아닙니다", "warn");
        return;
      }
      // mark all multiples > n
      for (let m = 2 * n; m <= N_MAX; m += n) composite.add(m);
      cells[n - 1].classList.add("seed");
      render();
    }

    function reset() {
      audio.click();
      composite.clear();
      composite.add(1);
      cells.forEach((c) => {
        c.classList.remove("seed", "composite", "prime", "twin");
      });
      render();
    }

    function render() {
      // True sieve simulation: a cell counts as "prime" only when it is NOT
      // in the composite set the user has built up. Before the user marks
      // multiples, every cell (except 1) appears as a candidate — so the
      // grid does not pre-reveal which numbers are prime. Twin pairs are
      // never auto-highlighted; the player has to spot consecutive primes
      // with gap = 2 themselves.
      let primesFound = 0;
      for (let n = 1; n <= N_MAX; n++) {
        const cell = cells[n - 1];
        const isComp = composite.has(n);
        cell.classList.toggle("composite", isComp);
        cell.classList.toggle("prime", !isComp && n > 1);
        if (!isComp && n > 1) primesFound++;
      }
      const elc = document.getElementById("mr-primes");
      if (elc) elc.textContent = String(primesFound).padStart(2, "0");
    }

    render();

    api.check = (raw) => {
      const v = Number(raw);
      return v === ANSWER;
    };
  },
};
