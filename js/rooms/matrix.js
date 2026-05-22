// ============================================================
// Matrix Vault — 2x2 determinant as a *geometric area scaling*
// ------------------------------------------------------------
// Concept   : 2×2 행렬은 평면을 변환한다. 단위 정사각형 (면적 1) 이
//             평행사변형으로 변형되고, 그 면적이 곧 |det(A)|.
// Setup     : A = [[3, 1], [2, 4]]  →  det = 12 − 2 = 10
// Insight   : 시각적으로 변형된 평행사변형의 면적을 추측 가능.
//             음수 행렬식은 *방향 뒤집힘* — 이 방은 양수 행렬식만 사용.
// Answer    : 10
// ============================================================

import { el } from "../ui.js";
import { audio } from "../audio.js";

const NS = "http://www.w3.org/2000/svg";

const A = [[3, 1], [2, 4]];
const ANSWER = A[0][0] * A[1][1] - A[0][1] * A[1][0]; // 10

const SIZE = 460;
const ORIGIN_X = 100;
const ORIGIN_Y = 360;
const UNIT = 56; // pixels per unit

function svgEl(name, attrs = {}) {
  const e = document.createElementNS(NS, name);
  for (const [k, v] of Object.entries(attrs)) if (v != null) e.setAttribute(k, v);
  return e;
}

function world(x, y) {
  return { x: ORIGIN_X + x * UNIT, y: ORIGIN_Y - y * UNIT };
}

export const matrix = {
  id: "matrix-vault",
  order: 5,
  title: "MATRIX VAULT",
  tag: "선형대수 // 행렬식 // 면적",
  concept: "2×2 행렬이 평면을 어떻게 늘리는가. 단위 정사각형이 변형된 후의 면적을 찾아라.",
  implemented: true,
  successLine: "행렬식 봉인이 풀렸습니다.",

  hints: [
    {
      label: "▸ HINT 01 — 단위 정사각형",
      text: "점선으로 그려진 단위 정사각형 (면적 1) 이 행렬 A 에 의해 보라색 평행사변형으로 변형됐다.",
    },
    {
      label: "▸ HINT 02 — 격자에서 세기",
      text: "변형된 도형의 면적을 격자 칸으로 추정해보아라. 정답은 *정수*.",
    },
    {
      label: "▸ HINT 03 — 픽의 정리",
      text: "다각형 면적 = (내부 격자점 개수) + (경계 격자점 개수)/2 − 1. 평행사변형 안의 점을 세면 정확한 면적이 나온다.",
    },
  ],

  lesson: {
    title: "행렬식의 기하학적 의미",
    sections: [
      {
        heading: "LV.1 — 기초: 벡터와 좌표",
        body: "평면의 한 점을 (x, y) 로 적고, 원점에서 그 점으로 향하는 화살표를 벡터라 한다. " +
              "두 벡터의 덧셈, 스칼라 배가 가장 기초 연산.",
      },
      {
        heading: "LV.2 — 행렬 = 평면을 보내는 규칙",
        body: "2×2 행렬 A 는 평면의 모든 점 (x, y) 를 새 좌표로 *보낸다*. " +
              "직선은 직선으로, 원점은 원점으로. 격자가 늘어나고 비틀린다. " +
              "특히 A 의 첫 열은 (1, 0) 의 도착지, 둘째 열은 (0, 1) 의 도착지.",
        formula: "A · ( x )  =  ( a · x + b · y )\n    ( y )      ( c · x + d · y )",
      },
      {
        heading: "LV.3 — 행렬식 = 면적 배율",
        body: "단위 정사각형 (면적 1) 이 행렬에 의해 평행사변형으로 변형됐을 때, " +
              "그 평행사변형의 *부호 있는 면적* 이 행렬식.",
        note: "음수면 평면이 뒤집힘. |det| 은 면적 배율. det = 0 이면 평면이 납작 — 역행렬 X.",
      },
      {
        heading: "왜 중요한가",
        body: "det(A) = 0 이면 평면이 *납작해진다* — 변환이 정보를 잃는다 (역행렬 존재 X). " +
              "PCA, 야코비안, 적분의 좌표변환 — 모두 행렬식의 면적 해석에서 출발.",
      },
    ],
  },

  // ----------------------------------------------------------
  mount(api) {
    const meta = el("div.firewall__meta", {}, [
      el("span", {}, [
        "A = [[",
        el("b", {}, [String(A[0][0])]), ", ",
        el("b", {}, [String(A[0][1])]), "], [",
        el("b", {}, [String(A[1][0])]), ", ",
        el("b", {}, [String(A[1][1])]), "]]",
      ]),
      el("span", {}, ["GOAL  //  변환된 평행사변형의 면적"]),
    ]);

    const wrap = el("div.firewall__grid-wrap");
    const svg = svgEl("svg", { class: "firewall__svg", viewBox: `0 0 ${SIZE} ${SIZE}` });

    // grid (-3..6 x, -1..6 y)
    for (let x = -2; x <= 6; x++) {
      const a = world(x, -1).x;
      svg.appendChild(svgEl("line", {
        x1: a, y1: world(0, -1).y, x2: a, y2: world(0, 6).y,
        stroke: "rgba(160,140,240,0.08)", "stroke-width": 1,
      }));
    }
    for (let y = -1; y <= 6; y++) {
      const a = world(-2, y).y;
      svg.appendChild(svgEl("line", {
        x1: world(-2, 0).x, y1: a, x2: world(6, 0).x, y2: a,
        stroke: "rgba(160,140,240,0.08)", "stroke-width": 1,
      }));
    }

    // axes
    svg.appendChild(svgEl("line", {
      x1: world(-2, 0).x, y1: world(0, 0).y, x2: world(6, 0).x, y2: world(0, 0).y,
      stroke: "rgba(180,160,250,0.35)", "stroke-width": 1.5,
    }));
    svg.appendChild(svgEl("line", {
      x1: world(0, -1).x, y1: world(0, -1).y, x2: world(0, 6).x, y2: world(0, 6).y,
      stroke: "rgba(180,160,250,0.35)", "stroke-width": 1.5,
    }));

    // original unit square (ghost)
    const orig = svgEl("polygon", {
      points: [[0,0],[1,0],[1,1],[0,1]].map(([x,y]) => { const p = world(x,y); return `${p.x},${p.y}`; }).join(" "),
      fill: "rgba(124,200,255,0.10)",
      stroke: "rgba(124,200,255,0.45)",
      "stroke-width": 1.5,
      "stroke-dasharray": "4 4",
    });
    svg.appendChild(orig);

    // transformed parallelogram
    // i = (a, c), j = (b, d)  (columns)
    const i = [A[0][0], A[1][0]];
    const j = [A[0][1], A[1][1]];
    const corners = [[0,0], i, [i[0]+j[0], i[1]+j[1]], j];
    const poly = svgEl("polygon", {
      points: corners.map(([x,y]) => { const p = world(x,y); return `${p.x},${p.y}`; }).join(" "),
      fill: "rgba(181,140,255,0.22)",
      stroke: "var(--accent-2)",
      "stroke-width": 2.5,
      filter: "drop-shadow(0 0 10px rgba(181,140,255,0.45))",
    });
    svg.appendChild(poly);

    // basis vector arrows
    const arrow = (x1, y1, x2, y2, color) => {
      const p1 = world(x1, y1), p2 = world(x2, y2);
      svg.appendChild(svgEl("line", {
        x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y,
        stroke: color, "stroke-width": 3, "stroke-linecap": "round",
      }));
      svg.appendChild(svgEl("circle", {
        cx: p2.x, cy: p2.y, r: 5, fill: color,
      }));
    };
    arrow(0, 0, i[0], i[1], "var(--accent)");      // i image
    arrow(0, 0, j[0], j[1], "var(--success)");      // j image

    // labels
    const label = (x, y, text, color) => {
      const p = world(x, y);
      const t = svgEl("text", {
        x: p.x + 6, y: p.y - 6,
        style: `font-size: 12px; font-family: var(--mono); fill: ${color}; font-weight: 600;`,
      });
      t.textContent = text;
      svg.appendChild(t);
    };
    label(i[0], i[1], `i → (${i[0]},${i[1]})`, "var(--accent)");
    label(j[0], j[1], `j → (${j[0]},${j[1]})`, "var(--success)");

    wrap.appendChild(svg);

    const stage = el("div.firewall", {}, [meta, wrap]);
    api.stage.appendChild(stage);

    api.logMany([
      { who: "SYS", text: "행렬 금고 — 평면 선형 변환 활성화.", tag: "system" },
      { who: "OBSERVER", text: "단위 정사각형이 보라색 평행사변형으로 변형됐다.", tag: "warn" },
      { who: "OBSERVER", text: "변형된 평행사변형의 *면적* 을 입력해라.", tag: "warn" },
    ]);
    api.setInputPlaceholder("AREA  =  ?");

    api.check = (raw) => Number(raw) === ANSWER;
  },
};
