// ============================================================
// Binary Firewall — 4x4 lattice paths, answer = C(8,4) = 70
// ------------------------------------------------------------
// Concept   : combinations, central symmetry, pairing argument
// Insight   : every path has a 180°-rotated partner (some self-paired);
//             total = ways to arrange 4 R's in 8 slots.
// Interaction:
//   - click adjacent nodes to extend the path (R or U only)
//   - on completion, the mirror path is auto-drawn beside it
//   - "AUTO TRACE" enumerates all 70 paths with paired animation
//   - hovering any node highlights its 180° rotated counterpart
// ============================================================

import { el, wait } from "../ui.js";
import { audio } from "../audio.js";

const N = 4; // 4x4 cells -> 5x5 nodes
const STEPS = 2 * N; // total moves per path
const NS = "http://www.w3.org/2000/svg";

const SVG_SIZE = 460;
const PAD = 40;
const STRIDE = (SVG_SIZE - PAD * 2) / N;

function nodeXY(x, y) {
  // y=0 is bottom row; SVG y grows downward, so flip.
  return { cx: PAD + x * STRIDE, cy: PAD + (N - y) * STRIDE };
}

function svgEl(name, attrs = {}) {
  const e = document.createElementNS(NS, name);
  for (const [k, v] of Object.entries(attrs)) {
    if (v != null) e.setAttribute(k, v);
  }
  return e;
}

export const firewall = {
  id: "firewall",
  order: 1,
  title: "BINARY FIREWALL",
  tag: "조합 // 대칭 // 짝짓기",
  concept: "AI 방화벽의 격자에 갇혔다. 출구는 우측 상단. 가능한 침투 경로의 총 수를 찾아라.",
  implemented: true,
  successLine: "데이터 격자가 동기화되었습니다. 다음 챕터를 잠금 해제합니다.",

  hints: [
    {
      label: "▸ HINT 01 — 이동 규칙",
      text: "한 경로는 → 와 ↑ 의 연속. 둘이 합쳐 정확히 몇 번 움직여야 (4,4)에 닿는가?",
    },
    {
      label: "▸ HINT 02 — 노드 호버",
      text: "노드 위에 커서를 두면 중심에 대한 짝점이 함께 빛난다. 모든 점은 짝을 가진다.",
    },
    {
      label: "▸ HINT 03 — 이진 시퀀스",
      text: "경로는 8자리의 이진 시퀀스(예: RURUURRU). 8자리 중 R 4개의 위치를 고르는 경우의 수.",
    },
  ],

  lesson: {
    title: "조합론과 격자 경로",
    sections: [
      {
        level: 1,
        heading: "기초: 팩토리얼",
        body: "1 부터 n 까지의 자연수를 모두 곱한 것이 팩토리얼 n!. " +
              "n 개의 서로 다른 물건을 한 줄로 세우는 방법의 수.",
        formula: "n!  =  1 · 2 · 3 · … · n         (관습으로 0! = 1)",
      },
      {
        level: 2,
        heading: "순열과 조합",
        body: "n 개 중 k 개를 *순서 있게* 뽑기 = 순열 P(n,k). " +
              "*순서 없이* (어느 것을 뽑았는가만) 뽑기 = 조합 C(n,k).",
        formula: "C(n, k)  =  n! / ( k! · (n − k)! )",
      },
      {
        level: 3,
        heading: "격자 경로의 환원",
        body: "(0,0) 에서 (a, b) 까지 → / ↑ 만으로 가는 경로 = " +
              "총 (a + b) 걸음 중 → 가 들어갈 a 개의 자리를 고르는 일. 곧 격자 경로 = 조합 문제.",
        formula: "P(a, b)  =  C(a + b, a)",
      },
      {
        heading: "이 방의 계산",
        body: "4 × 4 격자 → 가로 4 번 + 세로 4 번 = 총 8 걸음. " +
              "8 걸음 중 → 가 들어갈 자리 4 개를 고르는 경우의 수.",
        formula:
          "P(4, 4)  =  C(8, 4)  =  8! / (4! · 4!)\n" +
          "       =  (8 · 7 · 6 · 5) / (4 · 3 · 2 · 1)\n" +
          "       =  1680 / 24",
        note: "마지막 나눗셈을 직접 해보아라 — 그게 정답.",
      },
      {
        heading: "보너스 — 중심 대칭 짝짓기",
        body: "모든 경로는 격자 중심을 기준으로 180° 회전시킨 짝꿍 경로를 가진다. " +
              "일부는 자기 자신과 짝 (self-symmetric).",
        note: "이 단순한 짝짓기 논증이 더 복잡한 카탈란 수·반사 원리의 출발점.",
      },
    ],
  },

  // ----------------------------------------------------------
  // mount(api) — builds the puzzle inside api.stage.
  // ----------------------------------------------------------
  mount(api) {
    const meta = el("div.firewall__meta", {}, [
      el("span", {}, ["LATTICE 4×4  //  ENTRY → GATEWAY"]),
      el("span", {}, [
        "YOU TRACED ",
        el("b", { id: "fw-count" }, ["00"]),
      ]),
    ]);

    const wrap = el("div.firewall__grid-wrap");
    const svg = svgEl("svg", {
      class: "firewall__svg",
      viewBox: `0 0 ${SVG_SIZE} ${SVG_SIZE}`,
    });
    wrap.appendChild(svg);

    // -- grid lines --
    for (let i = 0; i <= N; i++) {
      svg.appendChild(svgEl("line", {
        class: "grid-line",
        x1: PAD, y1: PAD + i * STRIDE, x2: PAD + N * STRIDE, y2: PAD + i * STRIDE,
      }));
      svg.appendChild(svgEl("line", {
        class: "grid-line",
        x1: PAD + i * STRIDE, y1: PAD, x2: PAD + i * STRIDE, y2: PAD + N * STRIDE,
      }));
    }

    // -- labels --
    const entryLbl = svgEl("text", {
      class: "label", x: PAD - 6, y: PAD + N * STRIDE + 22, "text-anchor": "start",
    });
    entryLbl.textContent = "ENTRY ◐";
    svg.appendChild(entryLbl);

    const exitLbl = svgEl("text", {
      class: "label", x: PAD + N * STRIDE + 6, y: PAD - 14, "text-anchor": "end",
    });
    exitLbl.textContent = "◑ GATEWAY";
    svg.appendChild(exitLbl);

    // -- nodes --
    const nodeMap = new Map(); // "x,y" -> circle element
    for (let y = 0; y <= N; y++) {
      for (let x = 0; x <= N; x++) {
        const { cx, cy } = nodeXY(x, y);
        const c = svgEl("circle", {
          class: "node" +
            (x === 0 && y === 0 ? " endpoint" : "") +
            (x === N && y === N ? " endpoint exit" : ""),
          cx, cy, r: 7,
          "data-x": x, "data-y": y,
          tabindex: "0",
        });
        c.addEventListener("mouseenter", () => onNodeHover(x, y));
        c.addEventListener("mouseleave", () => onNodeHover(null));
        c.addEventListener("click", () => onNodeClick(x, y));
        svg.appendChild(c);
        nodeMap.set(`${x},${y}`, c);
      }
    }

    // -- active path lines (drawn last so they sit on top) --
    const pathLive = svgEl("polyline", { class: "path-live", points: "" });
    const pathMirror = svgEl("polyline", { class: "path-mirror", points: "" });
    svg.appendChild(pathMirror);
    svg.appendChild(pathLive);

    // -- step indicator (R/U badges) --
    const stepRow = el("div.steps", { id: "fw-steps" });
    rebuildSteps();

    // -- controls --
    const dirR = el("button.btn.btn--ghost.dir-btn", { onclick: () => stepDir("R") }, ["→"]);
    const dirU = el("button.btn.btn--ghost.dir-btn", { onclick: () => stepDir("U") }, ["↑"]);
    const resetBtn = el("button.btn.btn--ghost", { onclick: resetPath }, ["RESET"]);
    const controls = el("div.firewall__controls", {}, [dirR, dirU, resetBtn]);

    const root = el("div.firewall", {}, [meta, wrap, stepRow, controls]);
    api.stage.appendChild(root);

    // -- intro dialog --
    api.logMany([
      { who: "SYS", text: "Booting AI defense grid...", tag: "system" },
      { who: "SYS", text: "Firewall integrity 100%. Lattice 4×4 online.", tag: "system" },
      { who: "OBSERVER", text: "너는 좌측 하단의 데이터 패킷. 출구는 우측 상단.", tag: "warn" },
      { who: "OBSERVER", text: "이동 권한: 오른쪽(→), 위(↑) 만. 가능한 모든 경로의 수를 전송해라.", tag: "warn" },
      { who: "OBSERVER", text: "한 번이라도 경로를 직접 그어보고, 노드 위를 떠다녀봐라.", tag: "system" },
    ]);
    api.setInputPlaceholder("PATH COUNT _");

    // ==========================================================
    // state
    // ==========================================================
    let pathNodes = [{ x: 0, y: 0 }];     // current trace
    let discovered = new Map();           // pathString -> true

    // ==========================================================
    // helpers
    // ==========================================================

    function pathString(nodes) {
      let s = "";
      for (let i = 1; i < nodes.length; i++) {
        s += nodes[i].x > nodes[i - 1].x ? "R" : "U";
      }
      return s;
    }

    function mirrorPath(nodes) {
      // 180° rotation about (N/2, N/2). Reverse order so start = (0,0).
      return nodes.map((n) => ({ x: N - n.x, y: N - n.y })).reverse();
    }

    function setHead() {
      svg.querySelectorAll(".node").forEach((n) => n.classList.remove("in-path", "in-mirror"));
      for (const p of pathNodes) {
        nodeMap.get(`${p.x},${p.y}`)?.classList.add("in-path");
      }
    }

    function drawPath(line, nodes) {
      const pts = nodes.map((n) => {
        const { cx, cy } = nodeXY(n.x, n.y);
        return `${cx},${cy}`;
      });
      line.setAttribute("points", pts.join(" "));
    }

    function rebuildSteps(s = "") {
      stepRow.innerHTML = "";
      for (let i = 0; i < STEPS; i++) {
        const ch = s[i] || "";
        const cls = ch === "R" ? "step r" : ch === "U" ? "step u" : "step";
        stepRow.appendChild(el("div." + cls.replace(/ /g, "."), {}, [ch || "·"]));
      }
    }

    function updateCount() {
      const n = discovered.size;
      const elc = document.getElementById("fw-count");
      if (elc) elc.textContent = String(n).padStart(2, "0");
    }

    function canStep(dir) {
      const head = pathNodes[pathNodes.length - 1];
      if (dir === "R") return head.x < N;
      if (dir === "U") return head.y < N;
      return false;
    }

    // ==========================================================
    // interactions
    // ==========================================================

    function onNodeHover(x, y) {
      svg.querySelectorAll(".node.mirror-hover, .node.in-mirror")
        .forEach((n) => n.classList.remove("mirror-hover", "in-mirror"));
      if (x == null) return;
      const mx = N - x, my = N - y;
      const m = nodeMap.get(`${mx},${my}`);
      if (m) {
        m.classList.add("mirror-hover");
        audio.hover();
      }
    }

    function onNodeClick(x, y) {
      const head = pathNodes[pathNodes.length - 1];
      // step forward to a neighbor
      if ((x === head.x + 1 && y === head.y) || (x === head.x && y === head.y + 1)) {
        pathNodes.push({ x, y });
        afterStep();
        return;
      }
      // step back (last node clicked)
      if (pathNodes.length > 1) {
        const prev = pathNodes[pathNodes.length - 2];
        if (prev.x === x && prev.y === y) {
          pathNodes.pop();
          afterStep();
          return;
        }
      }
      audio.error();
    }

    function stepDir(dir) {
      if (!canStep(dir)) { audio.error(); return; }
      const head = pathNodes[pathNodes.length - 1];
      pathNodes.push({
        x: head.x + (dir === "R" ? 1 : 0),
        y: head.y + (dir === "U" ? 1 : 0),
      });
      afterStep();
    }

    function afterStep() {
      audio.step();
      setHead();
      drawPath(pathLive, pathNodes);
      rebuildSteps(pathString(pathNodes));

      const head = pathNodes[pathNodes.length - 1];
      if (head.x === N && head.y === N) onPathComplete();
      else {
        // clear mirror while in progress
        drawPath(pathMirror, []);
      }
    }

    async function onPathComplete() {
      const s = pathString(pathNodes);
      const fresh = !discovered.has(s);
      discovered.set(s, true);

      // animate mirror
      const mirror = mirrorPath(pathNodes);
      const mSig = pathString(mirror);
      const selfSym = s === mSig;

      // sequentially reveal mirror nodes
      drawPath(pathMirror, []);
      const mirrorPts = [];
      for (const m of mirror) {
        mirrorPts.push(m);
        drawPath(pathMirror, mirrorPts);
        nodeMap.get(`${m.x},${m.y}`)?.classList.add("in-mirror");
        audio.tick();
        await wait(60);
      }

      if (!selfSym) discovered.set(mSig, true);
      updateCount();

      if (fresh) {
        const total = discovered.size;
        if (selfSym && total <= 4) {
          api.log({ who: "SYS", text: `▷ ${s} 은 자기 자신의 짝이다 (self-symmetric).`, tag: "ok", delay: 80 });
        } else if (total === 2) {
          api.log({ who: "SYS", text: "▷ 패턴 감지 — 모든 경로는 180° 짝과 함께 온다.", tag: "ok", delay: 80 });
        } else if (total === 6) {
          api.log({ who: "OBSERVER", text: "한 경로 = 8칸의 선택. R/U 시퀀스를 떠올려라.", tag: "warn", delay: 80 });
        }
      }

      await wait(420);
      // reset for the next trace
      pathNodes = [{ x: 0, y: 0 }];
      setHead();
      drawPath(pathLive, []);
      drawPath(pathMirror, []);
      svg.querySelectorAll(".node.in-mirror").forEach((n) => n.classList.remove("in-mirror"));
      rebuildSteps();
    }

    function resetPath() {
      pathNodes = [{ x: 0, y: 0 }];
      setHead();
      drawPath(pathLive, []);
      drawPath(pathMirror, []);
      rebuildSteps();
      audio.click();
    }

    // initial node highlights
    setHead();

    // ==========================================================
    // answer check
    // ==========================================================
    api.check = (raw) => Number(raw) === 70;
  },
};
