// ============================================================
// Ancient Temple — Chinese Remainder Theorem (CRT)
// ------------------------------------------------------------
// Concept   : 세 신탁이 7, 11, 13 의 주기로 따로 흐른다.
// Oracle    : X mod 7 = 3,  X mod 11 = 4,  X mod 13 = 5
// Insight   : 모듈러스가 서로 *소수*라서 7·11·13 = 1001 범위 내에 답은 *유일*.
//             X = (3·143·5 + 4·91·4 + 5·77·12) mod 1001  ← CRT 결합
// Answer    : 213
// ============================================================

import { el } from "../ui.js";
import { audio } from "../audio.js";

const NS = "http://www.w3.org/2000/svg";

const PRIMES  = [7, 11, 13];
const TARGETS = [3, 4, 5];
const M_TOTAL = PRIMES.reduce((a, b) => a * b, 1); // 1001
const ANSWER  = 213;

const DIAL_VB     = 200;
const DIAL_CX     = 100;
const DIAL_CY     = 100;
const DIAL_R      = 72;
const DIAL_MARKER = 58;

function angleAt(i, n) {
  return (i / n) * Math.PI * 2 - Math.PI / 2;
}
function svgEl(name, attrs = {}) {
  const e = document.createElementNS(NS, name);
  for (const [k, v] of Object.entries(attrs)) if (v != null) e.setAttribute(k, v);
  return e;
}

export const temple = {
  id: "ancient-temple",
  order: 3,
  title: "ANCIENT TEMPLE",
  tag: "정수론 // 중국인의 나머지 정리",
  concept: "세 신탁이 서로 다른 주기로 흐르는 신전. 모든 잔차를 동시에 만족하는 X 를 찾아라.",
  implemented: true,
  successLine: "세 시간선이 동기화되었습니다. 양자 카지노로 진입합니다.",

  hints: [
    {
      label: "▸ HINT 01 — 신탁의 세 잔차",
      text: "X mod 7 = 3,  X mod 11 = 4,  X mod 13 = 5. 이걸 동시에 만족하는 정수 X.",
    },
    {
      label: "▸ HINT 02 — 유일성",
      text: "7·11·13 = 1001. 모듈러스가 서로 소수이므로 0 ≤ X < 1001 에 답이 *유일하게* 존재 (CRT).",
    },
    {
      label: "▸ HINT 03 — CRT 결합 공식",
      text: "Mᵢ = 1001 / pᵢ, yᵢ = Mᵢ⁻¹ mod pᵢ.  X ≡ Σ rᵢ · Mᵢ · yᵢ  (mod 1001).",
    },
    {
      label: "▸ HINT 04 — 역원 값",
      text: "M₁=143, M₂=91, M₃=77.  y₁=5 (3·5≡1 mod 7), y₂=4, y₃=12.  대입 후 mod 1001.",
    },
  ],

  lesson: {
    title: "중국인의 나머지 정리 (CRT)",
    sections: [
      {
        heading: "정리 — 손자 (3 ~ 5 세기 중국)",
        body: "m₁, m₂, …, mₖ 가 *두 쌍씩 서로소* 이면, " +
              "임의의 r₁, …, rₖ 에 대해 다음 연립 합동식은 " +
              "mod M = ∏ mᵢ 안에 *유일한* 해 X 를 가진다.",
        formula: "X ≡ r₁ (mod m₁)\nX ≡ r₂ (mod m₂)\n     ⋮\nX ≡ rₖ (mod mₖ)",
      },
      {
        heading: "결합 공식",
        body: "Mᵢ = M / mᵢ 로 두고, yᵢ ≡ Mᵢ⁻¹ (mod mᵢ) 인 모듈러 역원을 구한다.",
        formula: "X  ≡  Σᵢ  rᵢ · Mᵢ · yᵢ   (mod M)",
      },
      {
        heading: "모듈러 역원이란",
        body: "a · x ≡ 1 (mod m) 인 x 를 a 의 모듈러 역원이라 한다. " +
              "gcd(a, m) = 1 일 때만 존재. 확장 유클리드 알고리즘으로 계산.",
      },
      {
        heading: "풀이 절차 (이 방 기준)",
        body: "1) 세 잔차 r₁, r₂, r₃ 를 읽는다.\n" +
              "2) M = p₁·p₂·p₃ 를 계산한다.\n" +
              "3) Mᵢ = M / pᵢ 와 yᵢ = Mᵢ⁻¹ mod pᵢ 를 구한다 (확장 유클리드).\n" +
              "4) X = Σ rᵢ · Mᵢ · yᵢ 를 계산한 뒤 mod M 으로 0 ≤ X < M 범위로 줄인다.",
      },
      {
        heading: "응용",
        body: "RSA 의 효율적 복호화, 큰 정수 계산의 분할 (Garner 알고리즘), " +
              "메톤 주기를 비롯한 천문 달력 계산까지 — 모두 CRT 의 응용.",
      },
    ],
  },

  // ----------------------------------------------------------
  mount(api) {
    const dials = PRIMES.map((p, idx) => buildDial(p, TARGETS[idx], idx));
    const dialsRow = el("div.crt-row", {}, dials.map((d) => d.wrap));

    const meta = el("div.firewall__meta", {}, [
      el("span", {}, ["ORACLE : X mod 7 = 3,  X mod 11 = 4,  X mod 13 = 5"]),
      el("span", {}, [
        "SEARCH SPACE  ",
        el("b", {}, ["0 … 1000"]),
      ]),
    ]);

    const preview = el("div.crt-preview.mono", {
      id: "tp-preview",
    }, ["X = ?    →    (?, ?, ?)"]);

    const stage = el("div.firewall", {}, [meta, dialsRow, preview]);
    api.stage.appendChild(stage);

    api.logMany([
      { who: "SYS", text: "고대 신전 — 세 신탁이 서로 다른 주기로 회전한다.", tag: "system" },
      { who: "OBSERVER", text: "신탁의 잔차: 7 → 3,  11 → 4,  13 → 5.", tag: "warn" },
      { who: "OBSERVER", text: "세 잔차를 *동시에* 만족하는 X 를 입력해라 (0 ≤ X < 1001).", tag: "warn" },
      { who: "SYS",      text: "TIP : 입력란에 X 를 적으면 세 신탁이 X mod pᵢ 위치로 회전한다 (실시간).", tag: "system" },
    ]);
    api.setInputPlaceholder("X = _   (preview live)");

    // initial X = 0
    dials.forEach((d) => setMarker(d, 0));

    // Live preview as the user types (no submit required).
    // We attach to the room's input via document query — the room
    // shell exposes a single <input.input.mono> per screen.
    const inputEl = document.querySelector(".input");
    if (inputEl) {
      inputEl.addEventListener("input", () => {
        const raw = inputEl.value.trim();
        const x = Number(raw);
        if (!Number.isFinite(x)) return;
        dials.forEach((d) => setMarker(d, ((x % d.p) + d.p) % d.p));
        const r1 = ((x % 7) + 7) % 7;
        const r2 = ((x % 11) + 11) % 11;
        const r3 = ((x % 13) + 13) % 13;
        preview.textContent = `X = ${raw}    →    (${r1}, ${r2}, ${r3})    target (3, 4, 5)`;
        preview.classList.toggle("match", r1 === 3 && r2 === 4 && r3 === 5);
      });
    }

    api.check = (raw) => {
      const x = Number(raw);
      if (!Number.isInteger(x) || x < 0) return false;
      audio.click();
      return x === ANSWER;
    };
  },
};

// ------------------------------------------------------------
// dial builder
// ------------------------------------------------------------
function buildDial(p, target, idx) {
  const wrap = el("div.crt-dial");
  const svg = svgEl("svg", { viewBox: `0 0 ${DIAL_VB} ${DIAL_VB}`, class: "crt-svg" });

  // background ring
  svg.appendChild(svgEl("circle", {
    cx: DIAL_CX, cy: DIAL_CY, r: DIAL_R, fill: "none",
    stroke: "rgba(160,140,240,0.22)", "stroke-width": 1.5,
  }));

  // tick dots and labels
  for (let i = 0; i < p; i++) {
    const a = angleAt(i, p);
    const isTarget = i === target;
    const dx = DIAL_CX + Math.cos(a) * DIAL_MARKER;
    const dy = DIAL_CY + Math.sin(a) * DIAL_MARKER;

    svg.appendChild(svgEl("circle", {
      cx: dx, cy: dy, r: isTarget ? 7 : 3,
      fill: isTarget ? "rgba(93,255,166,0.9)" : "rgba(140,130,180,0.32)",
      stroke: isTarget ? "#fff" : "none",
      "stroke-width": isTarget ? 1.5 : 0,
      filter: isTarget ? "drop-shadow(0 0 8px rgba(93,255,166,0.8))" : null,
    }));

    const tx = DIAL_CX + Math.cos(a) * (DIAL_R + 14);
    const ty = DIAL_CY + Math.sin(a) * (DIAL_R + 14) + 4;
    const txt = svgEl("text", {
      x: tx, y: ty, "text-anchor": "middle",
      style: `font-size: 10.5px; fill: ${isTarget ? "var(--success)" : "var(--fg-mute)"}; font-family: var(--mono);`,
    });
    txt.textContent = String(i);
    svg.appendChild(txt);
  }

  // marker arm
  const markerLine = svgEl("line", {
    x1: DIAL_CX, y1: DIAL_CY,
    x2: DIAL_CX, y2: DIAL_CY - DIAL_MARKER,
    stroke: "var(--accent-2)", "stroke-width": 3,
    "stroke-linecap": "round",
    filter: "drop-shadow(0 0 6px rgba(181,140,255,0.7))",
  });
  const markerDot = svgEl("circle", {
    cx: DIAL_CX, cy: DIAL_CY - DIAL_MARKER, r: 8,
    fill: "var(--accent-2)", stroke: "#fff", "stroke-width": 2,
  });
  svg.appendChild(markerLine);
  svg.appendChild(markerDot);

  const head = el("div.crt-head.mono", {}, [
    el("span", {}, [`mod ${p}`]),
    el("span.crt-target", {}, [`target ${target}`]),
  ]);

  wrap.appendChild(head);
  wrap.appendChild(svg);

  return { wrap, svg, markerLine, markerDot, p, idx };
}

function setMarker(dial, value) {
  const a = angleAt(value, dial.p);
  const x = DIAL_CX + Math.cos(a) * DIAL_MARKER;
  const y = DIAL_CY + Math.sin(a) * DIAL_MARKER;
  dial.markerLine.setAttribute("x2", x);
  dial.markerLine.setAttribute("y2", y);
  dial.markerDot.setAttribute("cx", x);
  dial.markerDot.setAttribute("cy", y);
}
