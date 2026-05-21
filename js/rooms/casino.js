// ============================================================
// Quantum Casino — Discrete Logarithm (Fermat's little theorem)
// ------------------------------------------------------------
// Concept   : 소수 p = 23 의 잔여 순환. 원시근 g 의 거듭제곱이 1..p-1 을 모두 한 번씩 거친다.
// Question  : g^x ≡ y (mod p) 인 x 를 찾아라.
// Setup     : p = 23,  g = 5 (23의 원시근),  y = 18
// Insight   : Fermat — g^{p-1} ≡ 1 (mod p). 즉 22 주기로 순환.
//             원시근이면 5^1, 5^2, ..., 5^22 가 1..22 의 *순열*.
//             일반적으로 x 를 찾는 것은 어려운 문제 (이산 로그).
// UX        : 자동 STEP 추적은 제거. 사용자가 x 를 입력하면 그 결과 위치를
//             실시간 미리보기로 보여주고, 시도한 결과는 격자에 누적된다.
// ============================================================

import { el } from "../ui.js";
import { audio } from "../audio.js";

const NS = "http://www.w3.org/2000/svg";
const P = 23;
const G = 5;
const Y = 18;

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
      text: "23 은 소수. 페르마: g^(p−1) ≡ 1 (mod p) 이므로 거듭제곱은 22 주기로 순환.",
    },
    {
      label: "▸ HINT 02 — 원시근",
      text: "g = 5 는 23 의 원시근. 5¹, 5², …, 5²² 가 1..22 를 모두 한 번씩 거친다.",
    },
    {
      label: "▸ HINT 03 — 이산 로그",
      text: "5^x ≡ 18 (mod 23) 인 x. 큰 p 에선 어려운 문제지만, p = 23 은 거듭제곱으로 풀 만하다.",
    },
    {
      label: "▸ HINT 04 — 입력 미리보기",
      text: "입력란에 x 를 적으면 5^x mod 23 의 결과 위치가 격자에 미리 표시된다. 시도한 위치는 보라색으로 누적되어 추론을 도와준다.",
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
              "2) x 를 추측해 입력한 뒤 5^x mod 23 결과 위치를 본다.\n" +
              "3) 결과가 목표 y 에 닿는 x 를 찾는다.",
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
    const tried = new Map(); // x -> val

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

    // residue nodes 0..p-1 (built once, restyled per render)
    const node$ = [];
    for (let i = 0; i < P; i++) {
      const a = angleAt(i);
      const nx = CX + Math.cos(a) * R_NODE;
      const ny = CY + Math.sin(a) * R_NODE;
      const c = svgEl("circle", {
        cx: nx, cy: ny, r: 14,
        fill: "rgba(12,8,28,0.95)",
        stroke: "rgba(160,140,240,0.45)",
        "stroke-width": 1.5,
      });
      svg.appendChild(c);

      const t = svgEl("text", {
        x: nx, y: ny + 5, "text-anchor": "middle",
        style: "font-size: 13px; font-family: var(--mono); font-weight: 500; fill: var(--fg-dim);",
      });
      t.textContent = String(i);
      svg.appendChild(t);
      node$.push({ c, t });
    }

    // preview marker — hidden until the user enters something
    const marker = svgEl("circle", {
      cx: CX, cy: CY - R_NODE, r: 10,
      fill: "var(--accent)", stroke: "#fff", "stroke-width": 2,
      filter: "drop-shadow(0 0 10px rgba(124,200,255,0.9))",
      opacity: 0,
    });
    svg.appendChild(marker);

    // center readout — static target by default
    const centerVal = svgEl("text", {
      x: CX, y: CY - 4, "text-anchor": "middle",
      style: "font-size: 22px; fill: var(--fg); font-family: var(--mono); font-weight: 700;",
    });
    centerVal.textContent = `${G}^x  ≡  ${Y}`;
    const centerSub = svgEl("text", {
      x: CX, y: CY + 22, "text-anchor": "middle",
      style: "font-size: 11px; fill: var(--fg-mute); font-family: var(--mono); letter-spacing: 0.25em;",
    });
    centerSub.textContent = `(mod ${P})`;
    svg.appendChild(centerVal);
    svg.appendChild(centerSub);

    wrap.appendChild(svg);

    const resetBtn = el("button.btn.btn--ghost", { onclick: reset }, ["RESET"]);
    const controls = el("div.firewall__controls", {}, [resetBtn]);

    const stage = el("div.firewall", {}, [meta, wrap, controls]);
    api.stage.appendChild(stage);

    api.logMany([
      { who: "SYS", text: "양자 카지노 — 소수 23 의 잔여류 순환.", tag: "system" },
      { who: "OBSERVER", text: `g = ${G} 는 23 의 원시근. 1..22 가 5¹, 5², … 안에 모두 들어 있다.`, tag: "warn" },
      { who: "OBSERVER", text: `${G}^x ≡ ${Y} (mod ${P}) 를 만족하는 지수 x 를 찾아 입력해라.`, tag: "warn" },
      { who: "SYS",      text: "TIP: 입력란에 x 를 적으면 5^x mod 23 의 결과 위치가 격자에 실시간 표시된다.", tag: "system" },
    ]);
    api.setInputPlaceholder(`x  →  ${G}^x mod ${P} = ${Y}`);

    // ----------------------------------------------------------
    function setMarker(val) {
      const a = angleAt(val);
      marker.setAttribute("cx", CX + Math.cos(a) * R_NODE);
      marker.setAttribute("cy", CY + Math.sin(a) * R_NODE);
      marker.setAttribute("opacity", 1);
    }
    function hideMarker() { marker.setAttribute("opacity", 0); }

    function renderNodes() {
      const hitSet = new Set(tried.values());
      for (let i = 0; i < P; i++) {
        const isTarget = i === Y;
        const wasHit = hitSet.has(i);
        const { c, t } = node$[i];
        if (isTarget) {
          c.setAttribute("r", 18);
          c.setAttribute("fill", "rgba(93,255,166,0.22)");
          c.setAttribute("stroke", "var(--success)");
          c.setAttribute("stroke-width", 2.5);
          c.setAttribute("filter", "drop-shadow(0 0 10px rgba(93,255,166,0.7))");
          t.style.fill = "var(--success)";
          t.style.fontWeight = "700";
        } else if (wasHit) {
          c.setAttribute("r", 14);
          c.setAttribute("fill", "rgba(181,140,255,0.22)");
          c.setAttribute("stroke", "var(--accent-2)");
          c.setAttribute("stroke-width", 2);
          c.setAttribute("filter", "drop-shadow(0 0 6px rgba(181,140,255,0.45))");
          t.style.fill = "var(--fg)";
          t.style.fontWeight = "600";
        } else {
          c.setAttribute("r", 14);
          c.setAttribute("fill", "rgba(12,8,28,0.95)");
          c.setAttribute("stroke", "rgba(160,140,240,0.45)");
          c.setAttribute("stroke-width", 1.5);
          c.removeAttribute("filter");
          t.style.fill = "var(--fg-dim)";
          t.style.fontWeight = "500";
        }
      }
    }

    function compute(x) {
      let v = 1;
      for (let i = 0; i < x; i++) v = (v * G) % P;
      return v;
    }

    function reset() {
      audio.click();
      tried.clear();
      hideMarker();
      centerVal.textContent = `${G}^x  ≡  ${Y}`;
      renderNodes();
    }

    // live preview from the answer input
    const inputEl = document.querySelector(".input");
    if (inputEl) {
      inputEl.addEventListener("input", () => {
        const raw = inputEl.value.trim();
        if (raw === "") {
          hideMarker();
          centerVal.textContent = `${G}^x  ≡  ${Y}`;
          return;
        }
        const x = Number(raw);
        if (!Number.isInteger(x) || x < 0 || x > 999) return;
        const v = compute(x);
        tried.set(x, v);
        setMarker(v);
        centerVal.textContent = `→  ${v}`;
        renderNodes();
        audio.tick();
      });
    }

    renderNodes();

    // -- check --
    api.check = (raw) => {
      const x = Number(raw);
      if (!Number.isInteger(x) || x < 0) return false;
      return compute(x) === Y;
    };
  },
};
