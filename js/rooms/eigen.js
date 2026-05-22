// ============================================================
// Eigenchamber — eigenvalues of a 2×2 matrix
// ------------------------------------------------------------
// Concept   : 어떤 행렬은 *어떤 방향* 의 벡터를 그 방향 그대로 늘리기만 한다.
//             그 방향이 고유벡터, 늘어나는 배율이 고유값.
// Setup     : A = [[4, 2], [1, 3]]
//             특성방정식  det(A − λI) = (4−λ)(3−λ) − 2 = λ² − 7λ + 10 = 0
//             λ = 5 또는 λ = 2.  답: 5 (더 큰 쪽).
// UX        : 사용자가 단위 벡터 각도 θ 를 입력하면
//             원래 벡터와 변환된 벡터를 SVG 로 함께 그리고,
//             두 벡터가 평행해질 때 (= 고유벡터 발견) 그 배율 = 고유값.
// ============================================================

import { el } from "../ui.js";
import { audio } from "../audio.js";

const NS = "http://www.w3.org/2000/svg";

const A = [[4, 2], [1, 3]];
// eigenvalues of A: roots of λ² - 7λ + 10 = 0  →  5 and 2.
// Either is accepted as a valid eigenvalue answer.
const VALID_EIGENVALUES = [5, 2];

const SIZE = 460;
const CX = SIZE / 2;
const CY = SIZE / 2;
const UNIT = 32;

function svgEl(name, attrs = {}) {
  const e = document.createElementNS(NS, name);
  for (const [k, v] of Object.entries(attrs)) if (v != null) e.setAttribute(k, v);
  return e;
}
function world(x, y) {
  return { x: CX + x * UNIT, y: CY - y * UNIT };
}

function applyMatrix(M, [x, y]) {
  return [M[0][0] * x + M[0][1] * y, M[1][0] * x + M[1][1] * y];
}

function vectorLen([x, y]) { return Math.hypot(x, y); }

export const eigen = {
  id: "eigenchamber",
  order: 6,
  title: "EIGENCHAMBER",
  tag: "선형대수 // 고유값 // 불변 방향",
  concept: "어떤 방향의 벡터는 행렬을 곱해도 방향이 변하지 않는다. 그 *늘어나는 배율* 을 찾아라.",
  implemented: true,
  successLine: "고유 방향이 잠금을 풀었습니다.",

  hints: [
    {
      label: "▸ HINT 01 — 각도로 회전",
      text: "입력란에 θ 를 도(degree) 로 적으면 단위 벡터 v = (cos θ, sin θ) 와 변환된 A·v 가 격자 위에 함께 그려진다.",
    },
    {
      label: "▸ HINT 02 — 정렬의 순간",
      text: "θ 를 0~180 사이로 천천히 바꾸다 보면 v 와 A·v 가 *완전히 같은 직선 위* 에 놓이는 각이 나타난다.",
    },
    {
      label: "▸ HINT 03 — 길이의 비율",
      text: "정렬이 일어난 순간, A·v 의 길이가 v 의 몇 배인지 보아라. 그 *배율* 이 행렬이 그 방향에서 평면을 늘리는 양.",
    },
    {
      label: "▸ HINT 04 — 두 방향",
      text: "정렬되는 θ 는 (이 행렬에서) 두 개 — 0~180° 안에 두 번. 두 배율 중 *어느 것이든* 정답으로 인정된다.",
    },
  ],

  lesson: {
    title: "고유값과 고유벡터",
    sections: [
      {
        heading: "LV.1 — 기초: 벡터의 방향과 크기",
        body: "벡터 v 의 *방향* 은 단위 벡터 v / |v|, *크기* 는 |v| = √(x² + y²). " +
              "스칼라 배는 방향은 두고 크기만 바꾼다.",
      },
      {
        heading: "LV.2 — 행렬은 방향을 바꾼다",
        body: "대부분의 벡터 v 에 대해 A · v 는 *다른 방향* 을 가리킨다. " +
              "행렬은 평면을 늘리면서 동시에 비튼다.",
      },
      {
        heading: "LV.3 — 방향이 보존되는 특별한 벡터",
        body: "어떤 *특별한 방향* 의 벡터에 대해선 A · v 가 같은 방향 (혹은 정반대). " +
              "그 방향을 *고유벡터*, 길이가 변하는 배율을 *고유값* 이라 부른다.",
        formula: "A · v  =  λ · v",
        note: "\"각 행렬에 고유한 방향\" 이라는 점에서 \"고유\".",
      },
      {
        heading: "이 방의 발견 절차",
        body: "1) θ 를 조금씩 바꾸며 v 와 A·v 가 *같은 직선 위* 에 놓이는 순간을 찾는다.\n" +
              "2) 정렬됐을 때 두 벡터 길이의 비를 읽는다.\n" +
              "3) 그 비가 고유값.",
      },
      {
        heading: "왜 중요한가",
        body: "PCA (주성분 분석) 는 데이터의 *분산이 가장 큰 방향* 을 고유벡터로 찾는다. " +
              "구글 PageRank, 양자역학의 관측 가능량, 진동의 공명 모드 — 모두 고유값 분해가 핵심.",
      },
    ],
  },

  // ----------------------------------------------------------
  mount(api) {
    let currentAngleDeg = 30;

    const meta = el("div.firewall__meta", {}, [
      el("span", {}, [
        "A = [[",
        el("b", {}, [String(A[0][0])]), ", ",
        el("b", {}, [String(A[0][1])]), "], [",
        el("b", {}, [String(A[1][0])]), ", ",
        el("b", {}, [String(A[1][1])]), "]]",
      ]),
      el("span", {}, [
        "tr = ", el("b", {}, [String(A[0][0] + A[1][1])]),
        "   det = ", el("b", {}, [String(A[0][0] * A[1][1] - A[0][1] * A[1][0])]),
      ]),
    ]);

    const wrap = el("div.firewall__grid-wrap");
    const svg = svgEl("svg", { class: "firewall__svg", viewBox: `0 0 ${SIZE} ${SIZE}` });

    // grid
    for (let x = -6; x <= 6; x++) {
      const p = world(x, 0);
      svg.appendChild(svgEl("line", {
        x1: p.x, y1: world(0, -6).y, x2: p.x, y2: world(0, 6).y,
        stroke: "rgba(160,140,240,0.06)", "stroke-width": 1,
      }));
    }
    for (let y = -6; y <= 6; y++) {
      const p = world(0, y);
      svg.appendChild(svgEl("line", {
        x1: world(-6, 0).x, y1: p.y, x2: world(6, 0).x, y2: p.y,
        stroke: "rgba(160,140,240,0.06)", "stroke-width": 1,
      }));
    }
    // axes
    svg.appendChild(svgEl("line", {
      x1: world(-6, 0).x, y1: CY, x2: world(6, 0).x, y2: CY,
      stroke: "rgba(180,160,250,0.3)", "stroke-width": 1.5,
    }));
    svg.appendChild(svgEl("line", {
      x1: CX, y1: world(0, -6).y, x2: CX, y2: world(0, 6).y,
      stroke: "rgba(180,160,250,0.3)", "stroke-width": 1.5,
    }));

    // unit circle (where the input vector lives)
    svg.appendChild(svgEl("circle", {
      cx: CX, cy: CY, r: UNIT,
      fill: "none", stroke: "rgba(124,200,255,0.25)", "stroke-width": 1,
      "stroke-dasharray": "3 4",
    }));

    // original vector (blue) and image (purple)
    const vecLine = svgEl("line", {
      stroke: "var(--accent)", "stroke-width": 3, "stroke-linecap": "round",
    });
    const vecHead = svgEl("circle", { r: 6, fill: "var(--accent)" });
    const imgLine = svgEl("line", {
      stroke: "var(--accent-2)", "stroke-width": 3, "stroke-linecap": "round",
      filter: "drop-shadow(0 0 6px rgba(181,140,255,0.6))",
    });
    const imgHead = svgEl("circle", { r: 7, fill: "var(--accent-2)", stroke: "#fff", "stroke-width": 1.5 });

    svg.appendChild(vecLine);
    svg.appendChild(vecHead);
    svg.appendChild(imgLine);
    svg.appendChild(imgHead);

    // readout
    const readout = svgEl("text", {
      x: CX, y: 30, "text-anchor": "middle",
      style: "font-size: 13px; font-family: var(--mono); fill: var(--fg);",
    });
    svg.appendChild(readout);
    const ratioOut = svgEl("text", {
      x: CX, y: SIZE - 18, "text-anchor": "middle",
      style: "font-size: 14px; font-family: var(--mono); fill: var(--fg-dim);",
    });
    svg.appendChild(ratioOut);

    wrap.appendChild(svg);

    const stage = el("div.firewall", {}, [meta, wrap]);
    api.stage.appendChild(stage);

    api.logMany([
      { who: "SYS", text: "고유실 — 평면 선형 변환의 *불변 방향* 검색 중.", tag: "system" },
      { who: "OBSERVER", text: "입력란에 각도 θ (도) 를 적으면 단위 벡터 v 와 A·v 가 그려진다.", tag: "warn" },
      { who: "OBSERVER", text: "v 와 A·v 가 평행해지면 v 는 고유벡터. *큰 쪽* 고유값을 입력하라.", tag: "warn" },
    ]);
    api.setInputPlaceholder("θ (degree) 또는 답 λ");

    // ----------------------------------------------------------
    function render() {
      const theta = currentAngleDeg * Math.PI / 180;
      const v = [Math.cos(theta), Math.sin(theta)];
      const Av = applyMatrix(A, v);

      // v drawn at length 1 (scaled by UNIT)
      const vEnd = world(v[0], v[1]);
      vecLine.setAttribute("x1", CX);
      vecLine.setAttribute("y1", CY);
      vecLine.setAttribute("x2", vEnd.x);
      vecLine.setAttribute("y2", vEnd.y);
      vecHead.setAttribute("cx", vEnd.x);
      vecHead.setAttribute("cy", vEnd.y);

      // A·v drawn at its actual length
      const avEnd = world(Av[0], Av[1]);
      imgLine.setAttribute("x1", CX);
      imgLine.setAttribute("y1", CY);
      imgLine.setAttribute("x2", avEnd.x);
      imgLine.setAttribute("y2", avEnd.y);
      imgHead.setAttribute("cx", avEnd.x);
      imgHead.setAttribute("cy", avEnd.y);

      // parallelism — cosine of angle between v and Av
      const dot = v[0] * Av[0] + v[1] * Av[1];
      const cos = dot / (vectorLen(v) * vectorLen(Av) || 1);
      const isParallel = Math.abs(cos) > 0.9995;

      readout.textContent =
        `θ = ${currentAngleDeg.toFixed(1)}°    v = (${v[0].toFixed(2)}, ${v[1].toFixed(2)})    A·v = (${Av[0].toFixed(2)}, ${Av[1].toFixed(2)})`;

      const ratio = vectorLen(Av) / vectorLen(v); // = magnitude of λ
      if (isParallel) {
        const lam = (cos > 0 ? 1 : -1) * ratio;
        ratioOut.textContent = `▶ 평행 — λ ≈ ${lam.toFixed(3)}`;
        ratioOut.setAttribute("style",
          "font-size: 15px; font-family: var(--mono); fill: var(--success); font-weight: 700;");
        imgLine.setAttribute("stroke", "var(--success)");
        imgHead.setAttribute("fill", "var(--success)");
      } else {
        ratioOut.textContent = `|A·v| / |v| = ${ratio.toFixed(3)}   (not parallel yet)`;
        ratioOut.setAttribute("style",
          "font-size: 13px; font-family: var(--mono); fill: var(--fg-mute);");
        imgLine.setAttribute("stroke", "var(--accent-2)");
        imgHead.setAttribute("fill", "var(--accent-2)");
      }
    }

    // live update from input — treat as angle, BUT also accept the final answer.
    const inputEl = document.querySelector(".input");
    if (inputEl) {
      inputEl.addEventListener("input", () => {
        const raw = inputEl.value.trim();
        if (raw === "") return;
        const n = Number(raw);
        if (!Number.isFinite(n)) return;
        // Treat values in [0, 360] as angles for preview.
        if (n >= 0 && n <= 360) {
          currentAngleDeg = n;
          render();
          audio.tick();
        }
      });
    }

    render();

    // -- check: accept either eigenvalue --
    api.check = (raw) => {
      const n = Number(raw);
      if (!Number.isFinite(n)) return false;
      return VALID_EIGENVALUES.some((lam) => Math.abs(n - lam) < 1e-6);
    };
  },
};
