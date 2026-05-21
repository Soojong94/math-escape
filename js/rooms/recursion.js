// ============================================================
// Recursion Reactor — staircase climbing / Fibonacci discovery
// ------------------------------------------------------------
// Concept   : N 칸 계단을 한 번에 1 칸 또는 2 칸 점프로 오를 수 있다.
//             정상까지 가는 *서로 다른 경로* 의 수는?
// Setup     : N = 10. 답 = F(11) = 89.
// Discovery : 작은 N 에서 직접 경로를 만들어보면
//             1, 2, 3, 5, 8, 13, 21, 34, 55, 89 ... 의 피보나치 수열이 드러난다.
//             규칙:  f(n) = f(n−1) + f(n−2)   (마지막이 1 칸이거나 2 칸이거나)
// UX        : 사용자가 1 / 2 점프 버튼으로 정상까지의 경로를 직접 시뮬레이션.
//             각 경로 완료 시 자동 RESET 되고 \"발견한 경로\" 카운트가 누적.
//             N 도 1..10 으로 조절 가능 — 작은 N 부터 패턴 찾기.
// ============================================================

import { el } from "../ui.js";
import { audio } from "../audio.js";

const TARGET_N = 10;
const ANSWER = 89; // F(11)

const NS = "http://www.w3.org/2000/svg";
const SIZE = 460;

function svgEl(name, attrs = {}) {
  const e = document.createElementNS(NS, name);
  for (const [k, v] of Object.entries(attrs)) if (v != null) e.setAttribute(k, v);
  return e;
}

export const recursion = {
  id: "recursion-reactor",
  order: 8,
  title: "RECURSION REACTOR",
  tag: "조합 // 점화식 // 피보나치",
  concept: "10 칸 계단을 한 번에 1 칸 또는 2 칸씩 오를 수 있다. 서로 다른 경로의 수를 찾아라.",
  implemented: true,
  successLine: "재귀의 순환이 봉인을 풀었습니다.",

  hints: [
    {
      label: "▸ HINT 01 — 점프 규칙",
      text: "1 / 2 점프 버튼으로 정상까지 직접 올라가본다. 마지막 칸에 도달하면 하나의 경로 완성.",
    },
    {
      label: "▸ HINT 02 — 같은 경로는 한 번",
      text: "같은 점프 순서는 같은 경로. 처음 보는 점프 시퀀스만 카운트가 올라간다.",
    },
    {
      label: "▸ HINT 03 — 작은 N 부터",
      text: "STAGES 슬라이더로 N 을 1, 2, 3, … 작은 값부터 모두 발견해보면 수열의 패턴이 드러난다.",
    },
    {
      label: "▸ HINT 04 — 패턴의 정체",
      text: "발견된 경로 수의 수열: 1, 2, 3, 5, 8, … 각 항이 *앞 두 항의 합*. 어떤 유명한 수열인가?",
    },
  ],

  lesson: {
    title: "점화식과 피보나치 — 분할의 미학",
    sections: [
      {
        heading: "점화식 (recurrence relation)",
        body: "어떤 문제의 답을 *더 작은 같은 문제의 답들* 로 표현하는 방식. " +
              "전체를 풀지 않고도 작은 사례에서 시작해 큰 사례로 *쌓아 올린다*.",
      },
      {
        heading: "이 문제의 구조",
        body: "n 칸 계단 정상에 도착하는 마지막 점프는 *1 칸* 이거나 *2 칸*. " +
              "두 경우는 서로 겹치지 않고, 각각 \"n−1 칸 정상에 가는 경로\" 와 " +
              "\"n−2 칸 정상에 가는 경로\" 에 대응된다.",
        note: "곧 — 큰 문제가 두 개의 더 작은 문제로 *깔끔하게 분할*된다.",
      },
      {
        heading: "수열의 발견",
        body: "n = 1 부터 차례로 직접 세어보면 어떤 수열이 나타날까. " +
              "그 수열의 *각 항이 앞 두 항의 합* 이라는 패턴이 보일 것이다.",
      },
      {
        heading: "왜 중요한가",
        body: "피보나치는 토끼 번식, 식물 잎차례, 황금비, 동적 계획법의 첫 번째 예제 — " +
              "자연과 알고리즘 곳곳에 같은 점화식이 숨어 있다. " +
              "한 번의 *분할 통찰* 이 거듭제곱 시간 ↦ 선형 시간으로 문제를 줄인다.",
      },
    ],
  },

  // ----------------------------------------------------------
  mount(api) {
    let N = 4; // 사용자가 조절 가능 (1..10). 작은 N 부터 직접 발견하도록 4 로 시작.
    let position = 0;
    let currentPath = [];
    const found = new Map(); // n -> Set of stringified paths

    const meta = el("div.firewall__meta", {}, [
      el("span", {}, [
        "STAIRCASE  //  N = ",
        el("b", { id: "rc-N" }, [String(N)]),
        "   ·   GOAL N = ",
        el("b", {}, [String(TARGET_N)]),
      ]),
      el("span", {}, [
        "PATHS FOUND  ",
        el("b", { id: "rc-count" }, ["0"]),
      ]),
    ]);

    const wrap = el("div.firewall__grid-wrap");
    const svg = svgEl("svg", { class: "firewall__svg", viewBox: `0 0 ${SIZE} ${SIZE}` });

    // staircase steps drawn dynamically
    const stepsG = svgEl("g");
    const markerG = svgEl("g");
    svg.appendChild(stepsG);
    svg.appendChild(markerG);

    wrap.appendChild(svg);

    // N controller
    const nMinus = el("button.btn.btn--ghost", { onclick: () => setN(N - 1) }, ["N −"]);
    const nPlus  = el("button.btn.btn--ghost", { onclick: () => setN(N + 1) }, ["N +"]);
    const j1     = el("button.btn", { onclick: () => jump(1) }, ["↑  1"]);
    const j2     = el("button.btn", { onclick: () => jump(2) }, ["↑↑  2"]);
    const resetBtn = el("button.btn.btn--ghost", { onclick: resetClimb }, ["RESET CLIMB"]);
    const wipeBtn  = el("button.btn.btn--ghost", { onclick: wipeFound }, ["WIPE FOUND"]);

    const controls = el("div.firewall__controls", {}, [nMinus, nPlus, j1, j2, resetBtn, wipeBtn]);

    const stage = el("div.firewall", {}, [meta, wrap, controls]);
    api.stage.appendChild(stage);

    api.logMany([
      { who: "SYS", text: "재귀 반응로 — 계단 N 칸. 1 칸/2 칸 점프 가능.", tag: "system" },
      { who: "OBSERVER", text: "작은 N 부터 모든 경로를 직접 발견해보아라. 수열의 패턴이 보인다.", tag: "warn" },
      { who: "OBSERVER", text: `최종 목표: N = ${TARGET_N} 일 때의 경로 수를 입력하라.`, tag: "warn" },
    ]);
    api.setInputPlaceholder("PATHS  for  N = 10");

    // ----------------------------------------------------------
    function drawStairs() {
      while (stepsG.firstChild) stepsG.removeChild(stepsG.firstChild);
      const totalH = SIZE - 80;
      const stepH = totalH / Math.max(N, 1);
      const stepW = 40;
      for (let i = 0; i <= N; i++) {
        const y = SIZE - 40 - i * stepH;
        const x = 80 + i * stepW;
        const fill = i === 0 ? "rgba(124,200,255,0.18)" :
                     i === N ? "rgba(93,255,166,0.18)" :
                               "rgba(160,140,240,0.05)";
        const stroke = i === 0 ? "var(--accent)" :
                       i === N ? "var(--success)" :
                                 "rgba(160,140,240,0.3)";
        stepsG.appendChild(svgEl("rect", {
          x: x - stepW + 2, y: y - stepH + 2,
          width: stepW * 1.4, height: stepH - 4,
          rx: 6,
          fill, stroke, "stroke-width": i === 0 || i === N ? 2 : 1,
        }));
        // index label
        const t = svgEl("text", {
          x: x + 6, y: y - stepH / 2 + 5,
          style: `font-size: 12px; font-family: var(--mono); fill: ${i === 0 || i === N ? "#fff" : "var(--fg-mute)"};`,
        });
        t.textContent = String(i);
        stepsG.appendChild(t);
      }
      // entry / goal labels
      const entryT = svgEl("text", {
        x: 50, y: SIZE - 50, "text-anchor": "end",
        style: "font-size: 11px; font-family: var(--mono); fill: var(--accent); letter-spacing: 0.2em;",
      });
      entryT.textContent = "START";
      stepsG.appendChild(entryT);
      const goalT = svgEl("text", {
        x: 80 + N * stepW + stepW * 0.5, y: SIZE - 40 - N * stepH - 12, "text-anchor": "middle",
        style: "font-size: 11px; font-family: var(--mono); fill: var(--success); letter-spacing: 0.2em;",
      });
      goalT.textContent = "GOAL";
      stepsG.appendChild(goalT);
    }

    function drawMarker() {
      while (markerG.firstChild) markerG.removeChild(markerG.firstChild);
      const totalH = SIZE - 80;
      const stepH = totalH / Math.max(N, 1);
      const stepW = 40;
      const y = SIZE - 40 - position * stepH;
      const x = 80 + position * stepW;
      markerG.appendChild(svgEl("circle", {
        cx: x + 6, cy: y - stepH / 2 + 2, r: 12,
        fill: "var(--accent-2)", stroke: "#fff", "stroke-width": 2.5,
        filter: "drop-shadow(0 0 10px rgba(181,140,255,0.9))",
      }));
    }

    function updateCount() {
      const set = found.get(N) || new Set();
      const elc = document.getElementById("rc-count");
      if (elc) elc.textContent = String(set.size);
      const ne = document.getElementById("rc-N");
      if (ne) ne.textContent = String(N);
    }

    function setN(newN) {
      if (newN < 1 || newN > TARGET_N) return;
      audio.click();
      N = newN;
      position = 0;
      currentPath = [];
      drawStairs();
      drawMarker();
      updateCount();
    }

    function jump(step) {
      if (position + step > N) {
        audio.error();
        api.toast(`점프하면 정상을 넘는다 (${position + step} > ${N})`, "warn");
        return;
      }
      position += step;
      currentPath.push(step);
      audio.step();
      drawMarker();

      if (position === N) {
        const key = currentPath.join(",");
        if (!found.has(N)) found.set(N, new Set());
        const set = found.get(N);
        const isNew = !set.has(key);
        set.add(key);
        if (isNew) {
          api.log({
            who: "SYS",
            text: `▷ N=${N}  새 경로 발견 [${currentPath.join(" + ")}]  ·  누적 ${set.size}`,
            tag: "ok",
            delay: 60,
          });
        } else {
          api.log({
            who: "SYS",
            text: `▷ 이미 발견한 경로 [${currentPath.join(" + ")}]`,
            tag: "system",
            delay: 60,
          });
        }
        // auto reset for the next attempt
        setTimeout(() => resetClimb(true), 500);
      }
    }

    function resetClimb(silent = false) {
      if (!silent) audio.click();
      position = 0;
      currentPath = [];
      drawMarker();
      updateCount();
    }

    function wipeFound() {
      if (!confirm(`N=${N} 의 발견 기록을 비울까요?`)) return;
      audio.click();
      found.delete(N);
      resetClimb(true);
    }

    // ---- input check ----
    api.check = (raw) => {
      const v = Number(raw);
      return Number.isInteger(v) && v === ANSWER;
    };

    // initial paint
    drawStairs();
    drawMarker();
    updateCount();
  },
};
