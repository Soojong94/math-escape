// ============================================================
// Regression Lab — MSE / linear regression
// ------------------------------------------------------------
// Concept   : 데이터 점들에 가장 잘 맞는 직선은 *오차 제곱 평균* (MSE) 을
//             최소화하는 직선이다.
// Setup     : 7 점, true slope = 3, intercept = 1.
//             데이터:  (1,4) (2,7) (3,10) (4,13) (5,16) (6,19) (7,22)
//             정확히 y = 3x + 1  →  MSE = 0 일 때 slope = 3.
// UX        : 사용자가 기울기 m 을 입력하면 직선이 실시간으로 그려지고
//             MSE 가 갱신된다. MSE 가 0 인 슬로프를 입력하면 통과.
// Answer    : 3
// ============================================================

import { el } from "../ui.js";
import { audio } from "../audio.js";

const NS = "http://www.w3.org/2000/svg";

const DATA = [
  [1, 4], [2, 7], [3, 10], [4, 13], [5, 16], [6, 19], [7, 22],
];
const TRUE_SLOPE = 3;
const TRUE_INTERCEPT = 1;
const ANSWER = TRUE_SLOPE;

const SIZE = 460;
const PAD_L = 60, PAD_R = 30, PAD_T = 40, PAD_B = 50;
const PLOT_W = SIZE - PAD_L - PAD_R;
const PLOT_H = SIZE - PAD_T - PAD_B;
const X_MIN = 0, X_MAX = 8;
const Y_MIN = 0, Y_MAX = 26;

function svgEl(name, attrs = {}) {
  const e = document.createElementNS(NS, name);
  for (const [k, v] of Object.entries(attrs)) if (v != null) e.setAttribute(k, v);
  return e;
}
function toPx(x, y) {
  return {
    x: PAD_L + ((x - X_MIN) / (X_MAX - X_MIN)) * PLOT_W,
    y: PAD_T + (1 - (y - Y_MIN) / (Y_MAX - Y_MIN)) * PLOT_H,
  };
}

function computeMSE(slope, intercept) {
  let s = 0;
  for (const [x, y] of DATA) {
    const pred = slope * x + intercept;
    s += (pred - y) ** 2;
  }
  return s / DATA.length;
}

// Closed-form intercept that minimizes MSE for a given slope.
function bestInterceptFor(slope) {
  // ∂/∂b of (1/n)Σ(mx+b−y)² = 0  →  b = mean(y) − m·mean(x)
  let sx = 0, sy = 0;
  for (const [x, y] of DATA) { sx += x; sy += y; }
  return sy / DATA.length - slope * sx / DATA.length;
}

export const regression = {
  id: "regression-lab",
  order: 7,
  title: "REGRESSION LAB",
  tag: "통계 // 최소제곱 // MSE",
  concept: "흩어진 점들을 꿰뚫는 직선. MSE 를 최소화하는 기울기를 찾아라.",
  implemented: true,
  successLine: "최소제곱 봉인이 풀렸습니다.",

  hints: [
    {
      label: "▸ HINT 01 — 입력 = 기울기",
      text: "입력란에 m 을 적으면 그 기울기의 직선이 그려진다. 절편은 그 m 에서 MSE 가 최소가 되도록 자동 선택.",
    },
    {
      label: "▸ HINT 02 — 잔차의 의미",
      text: "각 데이터 점에서 직선까지의 *수직 거리* (분홍색 선) 가 잔차. MSE 는 그 거리의 제곱 평균.",
    },
    {
      label: "▸ HINT 03 — 시각의 단서",
      text: "직선이 데이터 점들을 *정확히 가운데*로 꿰뚫을 때, 모든 잔차가 사라지고 MSE 가 0 으로 떨어진다.",
    },
    {
      label: "▸ HINT 04 — 추정의 폭",
      text: "기울기를 작게/크게 바꿔보며 MSE 의 변화를 관찰해라. 어느 방향으로 가야 0 에 가까워지는가?",
    },
  ],

  lesson: {
    title: "최소제곱 회귀와 MSE",
    sections: [
      {
        level: 1,
        heading: "기초: 산점도와 평균",
        body: "여러 데이터 (x, y) 를 좌표평면에 점으로 찍은 것이 산점도. " +
              "x 들의 평균 x̄ = (1/n) Σ xᵢ. 데이터의 \"중심\" 을 한 수로 요약.",
      },
      {
        level: 2,
        heading: "직선의 방정식",
        body: "기울기 m 과 y 절편 b 로 정해지는 직선 y = m · x + b. " +
              "회귀의 핵심 질문: 어떤 (m, b) 가 데이터를 \"가장 잘\" 설명할까.",
      },
      {
        level: 3,
        heading: "MSE 와 최소제곱",
        body: "각 데이터 점에서 직선까지의 *수직 거리* 를 잔차, 잔차의 제곱 평균을 MSE 라 한다. " +
              "MSE 를 가장 작게 만드는 (m, b) 가 \"최적 회귀선\".",
        formula: "MSE  =  (1/n) · Σᵢ ( m·xᵢ + b − yᵢ )²",
        note: "왜 제곱인가? 잔차 부호를 없애고, 큰 오차에 큰 벌점을 주고, 미분이 깔끔해진다.",
      },
      {
        heading: "최소제곱 closed-form 공식",
        body: "MSE 를 m, b 로 편미분 = 0 두면 다음의 해를 얻는다.",
        formula:
          "x̄ = (Σ xᵢ) / n,    ȳ = (Σ yᵢ) / n\n" +
          "\n" +
          "m  =  Σ (xᵢ − x̄)(yᵢ − ȳ)   /   Σ (xᵢ − x̄)²\n" +
          "b  =  ȳ  −  m · x̄",
      },
      {
        heading: "이 방의 계산",
        body: "데이터 7 점:  (1,4) (2,7) (3,10) (4,13) (5,16) (6,19) (7,22).",
        formula:
          "STEP 1.  x̄ = (1+2+3+4+5+6+7) / 7 = 28 / 7 = 4\n" +
          "         ȳ = (4+7+10+13+16+19+22) / 7 = 91 / 7 = 13\n" +
          "\n" +
          "STEP 2.  x − x̄ :  −3, −2, −1, 0, 1, 2, 3\n" +
          "         y − ȳ :  −9, −6, −3, 0, 3, 6, 9\n" +
          "\n" +
          "STEP 3.  Σ (x−x̄)² = 9+4+1+0+1+4+9 = 28\n" +
          "         Σ (x−x̄)(y−ȳ) = 27+12+3+0+3+12+27 = 84\n" +
          "\n" +
          "STEP 4.  m  =  84 / 28  =  ?",
        note: "마지막 나눗셈만 직접 — 그게 정답 기울기.",
      },
      {
        heading: "왜 중요한가",
        body: "회귀는 통계·머신러닝의 출발점. " +
              "MSE 는 신경망 학습의 가장 기본적인 손실 함수이기도 하다 (경사하강법으로 수치 최적화).",
      },
    ],
  },

  // ----------------------------------------------------------
  mount(api) {
    const meta = el("div.firewall__meta", {}, [
      el("span", {}, [`DATA POINTS  //  n = ${DATA.length}`]),
      el("span", {}, ["MSE  ", el("b", { id: "rg-mse" }, ["—"])]),
    ]);

    const wrap = el("div.firewall__grid-wrap");
    const svg = svgEl("svg", { class: "firewall__svg", viewBox: `0 0 ${SIZE} ${SIZE}` });

    // grid lines
    for (let x = X_MIN; x <= X_MAX; x++) {
      const p = toPx(x, Y_MIN);
      const p2 = toPx(x, Y_MAX);
      svg.appendChild(svgEl("line", {
        x1: p.x, y1: p.y, x2: p2.x, y2: p2.y,
        stroke: "rgba(160,140,240,0.07)", "stroke-width": 1,
      }));
    }
    for (let y = Y_MIN; y <= Y_MAX; y += 5) {
      const p = toPx(X_MIN, y);
      const p2 = toPx(X_MAX, y);
      svg.appendChild(svgEl("line", {
        x1: p.x, y1: p.y, x2: p2.x, y2: p2.y,
        stroke: "rgba(160,140,240,0.07)", "stroke-width": 1,
      }));
      const lbl = svgEl("text", {
        x: p.x - 8, y: p.y + 4, "text-anchor": "end",
        style: "font-size: 10px; font-family: var(--mono); fill: var(--fg-mute);",
      });
      lbl.textContent = String(y);
      svg.appendChild(lbl);
    }
    // axes
    svg.appendChild(svgEl("line", {
      x1: PAD_L, y1: PAD_T + PLOT_H, x2: PAD_L + PLOT_W, y2: PAD_T + PLOT_H,
      stroke: "rgba(180,160,250,0.4)", "stroke-width": 1.5,
    }));
    svg.appendChild(svgEl("line", {
      x1: PAD_L, y1: PAD_T, x2: PAD_L, y2: PAD_T + PLOT_H,
      stroke: "rgba(180,160,250,0.4)", "stroke-width": 1.5,
    }));

    // x labels
    for (let x = X_MIN; x <= X_MAX; x++) {
      const p = toPx(x, Y_MIN);
      const lbl = svgEl("text", {
        x: p.x, y: p.y + 16, "text-anchor": "middle",
        style: "font-size: 10px; font-family: var(--mono); fill: var(--fg-mute);",
      });
      lbl.textContent = String(x);
      svg.appendChild(lbl);
    }

    // residual lines (drawn before points so points sit on top)
    const residualG = svgEl("g", { class: "residuals" });
    svg.appendChild(residualG);

    // fitted line
    const fitLine = svgEl("line", {
      stroke: "var(--accent-2)", "stroke-width": 3,
      "stroke-linecap": "round",
      filter: "drop-shadow(0 0 6px rgba(181,140,255,0.6))",
      opacity: 0,
    });
    svg.appendChild(fitLine);

    // data points
    for (const [x, y] of DATA) {
      const p = toPx(x, y);
      svg.appendChild(svgEl("circle", {
        cx: p.x, cy: p.y, r: 6,
        fill: "var(--accent)",
        stroke: "#fff", "stroke-width": 1.5,
        filter: "drop-shadow(0 0 4px rgba(124,200,255,0.6))",
      }));
    }

    wrap.appendChild(svg);

    const stage = el("div.firewall", {}, [meta, wrap]);
    api.stage.appendChild(stage);

    api.logMany([
      { who: "SYS", text: "회귀 실험실 — 산점도가 안정화됐다.", tag: "system" },
      { who: "OBSERVER", text: "직선의 기울기 m 을 입력하라. 절편은 그 m 에서 MSE 가 최소가 되도록 자동 선택된다.", tag: "warn" },
      { who: "OBSERVER", text: "MSE = 0 을 만드는 기울기 m 이 답.", tag: "warn" },
    ]);
    api.setInputPlaceholder("m  =  ?");

    // ----------------------------------------------------------
    function renderLine(slope) {
      const intercept = bestInterceptFor(slope);
      const p1 = toPx(X_MIN, slope * X_MIN + intercept);
      const p2 = toPx(X_MAX, slope * X_MAX + intercept);
      fitLine.setAttribute("x1", p1.x);
      fitLine.setAttribute("y1", p1.y);
      fitLine.setAttribute("x2", p2.x);
      fitLine.setAttribute("y2", p2.y);
      fitLine.setAttribute("opacity", 1);

      // residual lines
      while (residualG.firstChild) residualG.removeChild(residualG.firstChild);
      for (const [x, y] of DATA) {
        const pred = slope * x + intercept;
        const pd = toPx(x, y);
        const pp = toPx(x, pred);
        residualG.appendChild(svgEl("line", {
          x1: pd.x, y1: pd.y, x2: pp.x, y2: pp.y,
          stroke: "rgba(255,93,122,0.45)", "stroke-width": 1.5,
        }));
      }

      const mse = computeMSE(slope, intercept);
      const elc = document.getElementById("rg-mse");
      if (elc) elc.textContent = mse.toFixed(3);
    }

    const inputEl = document.querySelector(".input");
    if (inputEl) {
      inputEl.addEventListener("input", () => {
        const raw = inputEl.value.trim();
        if (raw === "") return;
        const m = Number(raw);
        if (!Number.isFinite(m)) return;
        renderLine(m);
        audio.tick();
      });
    }

    api.check = (raw) => {
      const m = Number(raw);
      if (!Number.isFinite(m)) return false;
      const mse = computeMSE(m, bestInterceptFor(m));
      return mse < 1e-9; // exact least-squares minimum (integer answer)
    };
  },
};
