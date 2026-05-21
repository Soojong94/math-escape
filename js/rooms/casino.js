// ============================================================
// Quantum Casino — Discrete Logarithm (Fermat's little theorem)
// ------------------------------------------------------------
// Concept   : 소수 p = 23 의 잔여 순환. 원시근 g 의 거듭제곱이 1..p-1 을 모두 한 번씩 거친다.
// Question  : g^x ≡ y (mod p) 인 x 를 찾아라.
// Setup     : p = 23,  g = 5 (23의 원시근),  y = 18
// Insight   : Fermat — g^{p-1} ≡ 1 (mod p). 즉 22 주기로 순환.
//             원시근이면 5^1, 5^2, ..., 5^22 가 1..22 의 *순열*.
//             일반적으로 x 를 찾는 것은 어려운 문제 (이산 로그).
// Answer    : 12   (5^12 mod 23 = 18)
// ============================================================

import { el } from "../ui.js";
import { audio } from "../audio.js";

const NS = "http://www.w3.org/2000/svg";
const P = 23;
const G = 5;
const Y = 18;
const ANSWER = 12;

const SIZE = 460;
const CX = SIZE / 2;
const CY = SIZE / 2;
const R_NODE = 180;

function angleAt(i) {
  return (i / P) * Math.PI * 2 - Math.PI / 2;
}
function svgEl(name, attrs = {}) {
  const e = document.createElementNS(NS, name);
  for (const [k, v] of Object.entries(attrs)) if (v != null) e.setAttribute(k, v);
  return e;
}

export const casino = {
  id: "quantum-casino",
  order: 4,
  title: "QUANTUM CASINO",
  tag: "정수론 // 이산 로그 // 페르마",
  concept: "소수 23 의 잔여류 순환. g^x ≡ y (mod 23) 인 x 를 찾아라.",
  implemented: true,
  successLine: "이산 로그 봉인 해제. 시스템 우회 완료.",

  hints: [
    {
      label: "▸ HINT 01 — 페르마 소정리",
      text: "23 은 소수. 페르마: g^{22} ≡ 1 (mod 23) 이므로 거듭제곱은 22 주기로 순환.",
    },
    {
      label: "▸ HINT 02 — 원시근",
      text: "g = 5 는 23 의 원시근. 5¹, 5², …, 5²² 가 1..22 를 모두 한 번씩 거친다.",
    },
    {
      label: "▸ HINT 03 — 이산 로그",
      text: "5^x ≡ 18 (mod 23) 인 x. 일반적으로 어려운 문제지만, p=23 에선 직접 거듭제곱.",
    },
    {
      label: "▸ HINT 04 — 단서",
      text: "STEP 버튼을 누르며 5¹, 5², 5³, … 의 값을 격자 위에서 추적해라. 마커가 18 에 닿으면 그때의 x.",
    },
  ],

  lesson: {
    title: "페르마 소정리 · 이산 로그",
    sections: [
      {
        heading: "페르마 소정리 (1640)",
        body: "p 가 소수이고 gcd(a, p) = 1 이면 다음이 성립.",
        formula: "a^(p − 1)  ≡  1   (mod p)",
        note: "곧 a 의 거듭제곱은 mod p 에서 최대 (p − 1) 주기로 순환.",
      },
      {
        heading: "원시근 (primitive root)",
        body: "g^x mod p 가 x = 1, 2, …, p − 1 에 대해 1 부터 p − 1 까지의 모든 값을 *한 번씩* 거치면 " +
              "g 를 p 의 원시근이라 한다.",
        formula: "ord_p(g)  =  p − 1",
      },
      {
        heading: "이산 로그 문제 (DLP)",
        body: "주어진 g, y, p 에 대해 다음을 만족하는 x 를 구하는 문제.",
        formula: "g^x  ≡  y   (mod p)",
        note: "큰 p 에서는 알려진 효율적 알고리즘이 없음. 이 어려움이 Diffie-Hellman 키 교환, ElGamal, ECDSA, 비트코인 서명의 기반.",
      },
      {
        heading: "풀이 절차 (이 방 기준)",
        body: "1) g 가 p 의 원시근인지 확인한다 (이 방은 g = 5, p = 23 으로 보장).\n" +
              "2) STEP 을 눌러 g¹, g², g³, … 의 값을 mod p 로 차례로 추적한다.\n" +
              "3) 마커가 목표 y 에 도달했을 때의 지수 x 가 답.",
      },
      {
        heading: "역방향이 어려운 이유",
        body: "g^x mod p 계산은 빠르다 (제곱 반복법으로 O(log x)). " +
              "그러나 거꾸로 x 를 찾는 일반적인 빠른 방법은 알려져 있지 않다. " +
              "이 *비대칭*이 공개키 암호의 본질.",
      },
    ],
  },

  // ----------------------------------------------------------
  mount(api) {
    const visited = []; // [{x, val}]

    const meta = el("div.firewall__meta", {}, [
      el("span", {}, [`p = ${P}  //  g = ${G}  //  target  y = ${Y}`]),
      el("span", {}, [
        "FORM  ",
        el("b", {}, [`${G}^x ≡ ${Y} (mod ${P})`]),
      ]),
    ]);

    const wrap = el("div.firewall__grid-wrap");
    const svg = svgEl("svg", { class: "firewall__svg", viewBox: `0 0 ${SIZE} ${SIZE}` });

    // ring guide
    svg.appendChild(svgEl("circle", {
      cx: CX, cy: CY, r: R_NODE, fill: "none",
      stroke: "rgba(160,140,240,0.12)", "stroke-width": 1,
    }));

    // residue nodes 0..p-1
    const node$ = [];
    for (let i = 0; i < P; i++) {
      const a = angleAt(i);
      const nx = CX + Math.cos(a) * R_NODE;
      const ny = CY + Math.sin(a) * R_NODE;
      const isTarget = i === Y;
      const c = svgEl("circle", {
        cx: nx, cy: ny, r: isTarget ? 19 : 14,
        fill: isTarget ? "rgba(93,255,166,0.22)" : "rgba(12,8,28,0.95)",
        stroke: isTarget ? "var(--success)" : "rgba(160,140,240,0.45)",
        "stroke-width": isTarget ? 2.5 : 1.5,
      });
      if (isTarget) c.setAttribute("filter", "drop-shadow(0 0 12px rgba(93,255,166,0.7))");
      svg.appendChild(c);

      const t = svgEl("text", {
        x: nx, y: ny + 5, "text-anchor": "middle",
        style: `font-size: 13px; fill: ${isTarget ? "var(--success)" : "var(--fg-dim)"}; font-family: var(--mono); font-weight: ${isTarget ? 700 : 500};`,
      });
      t.textContent = String(i);
      svg.appendChild(t);
      node$.push({ c, t });
    }

    // exponent labels (drawn as we visit)
    const expLabels = svgEl("g", { class: "exp-labels" });
    svg.appendChild(expLabels);

    // trail polyline (uses .path-mirror style)
    const trail = svgEl("polyline", {
      points: "",
      fill: "none",
      stroke: "var(--accent-2)",
      "stroke-width": 2.5,
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
      opacity: 0.85,
      filter: "drop-shadow(0 0 4px rgba(181,140,255,0.6))",
    });
    svg.appendChild(trail);

    // current marker
    const marker = svgEl("circle", {
      cx: CX + Math.cos(angleAt(1)) * R_NODE,
      cy: CY + Math.sin(angleAt(1)) * R_NODE,
      r: 9, fill: "var(--accent)", stroke: "#fff", "stroke-width": 2,
      filter: "drop-shadow(0 0 10px rgba(124,200,255,0.9))",
    });
    svg.appendChild(marker);

    // center readout
    const centerVal = svgEl("text", {
      x: CX, y: CY - 4, "text-anchor": "middle",
      style: "font-size: 26px; fill: var(--fg); font-family: var(--mono); font-weight: 700;",
    });
    centerVal.textContent = `${G}^0 = 1`;
    const centerSub = svgEl("text", {
      x: CX, y: CY + 22, "text-anchor": "middle",
      style: "font-size: 11px; fill: var(--fg-mute); font-family: var(--mono); letter-spacing: 0.25em;",
    });
    centerSub.textContent = `target = ${Y}`;
    svg.appendChild(centerVal);
    svg.appendChild(centerSub);

    wrap.appendChild(svg);

    const stepBtn  = el("button.btn", { onclick: stepForward }, [`STEP  ×${G}`]);
    const resetBtn = el("button.btn.btn--ghost", { onclick: reset }, ["RESET"]);
    const controls = el("div.firewall__controls", {}, [stepBtn, resetBtn]);

    const stage = el("div.firewall", {}, [meta, wrap, controls]);
    api.stage.appendChild(stage);

    api.logMany([
      { who: "SYS", text: "양자 카지노 — 소수 23 의 잔여류 순환.", tag: "system" },
      { who: "OBSERVER", text: `g = ${G} 는 23 의 원시근. ${G}¹, ${G}², … 이 1..22 를 모두 한 번씩 거친다.`, tag: "warn" },
      { who: "OBSERVER", text: `${G}^x ≡ ${Y} (mod ${P}) 인 x 를 찾아 입력해라.`, tag: "warn" },
    ]);
    api.setInputPlaceholder("x = _");

    // ----------------------------------------------------------
    let curX = 0, curVal = 1;
    visited.push({ x: 0, val: 1 });
    setMarker(curVal);

    function setMarker(val) {
      const a = angleAt(val);
      marker.setAttribute("cx", CX + Math.cos(a) * R_NODE);
      marker.setAttribute("cy", CY + Math.sin(a) * R_NODE);
    }

    function redrawTrail() {
      const pts = visited.map(({ val }) => {
        const a = angleAt(val);
        return `${CX + Math.cos(a) * R_NODE},${CY + Math.sin(a) * R_NODE}`;
      }).join(" ");
      trail.setAttribute("points", pts);
    }

    function redrawExpLabels() {
      // clear
      while (expLabels.firstChild) expLabels.removeChild(expLabels.firstChild);
      // small label next to each visited node
      for (const { x, val } of visited) {
        if (x === 0) continue;
        const a = angleAt(val);
        const lx = CX + Math.cos(a) * (R_NODE + 22);
        const ly = CY + Math.sin(a) * (R_NODE + 22) + 4;
        const t = svgEl("text", {
          x: lx, y: ly, "text-anchor": "middle",
          style: "font-size: 11px; fill: var(--accent-2); font-family: var(--mono);",
        });
        t.textContent = `x=${x}`;
        expLabels.appendChild(t);
      }
    }

    function stepForward() {
      if (curX >= P - 1) {
        api.toast("이미 한 사이클을 돌았다", "warn");
        return;
      }
      curX++;
      curVal = (curVal * G) % P;
      visited.push({ x: curX, val: curVal });
      audio.step();
      setMarker(curVal);
      redrawTrail();
      redrawExpLabels();
      centerVal.textContent = `${G}^${curX} = ${curVal}`;
      if (curVal === Y) {
        api.log({ who: "SYS", text: `▷ ${G}^${curX} = ${Y}. 입력값에 ${curX} 을 넣으면 봉인 해제.`, tag: "ok", delay: 80 });
      } else if (curX === 1) {
        api.log({ who: "SYS", text: `▷ ${G}^1 = ${G}. 매 스텝마다 ×${G} mod ${P}.`, tag: "system", delay: 80 });
      }
    }

    function reset() {
      audio.click();
      curX = 0; curVal = 1;
      visited.length = 0;
      visited.push({ x: 0, val: 1 });
      setMarker(1);
      redrawTrail();
      redrawExpLabels();
      centerVal.textContent = `${G}^0 = 1`;
    }

    // -- check --
    api.check = (raw) => {
      const x = Number(raw);
      if (!Number.isInteger(x) || x < 0) return false;
      // compute g^x mod p
      let v = 1;
      for (let i = 0; i < x; i++) v = (v * G) % P;
      return v === Y;
    };
  },
};
