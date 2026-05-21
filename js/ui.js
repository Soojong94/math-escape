// ============================================================
// ui — small DOM helpers shared by every screen
// (typing log, toast, element factory)
// ============================================================

import { audio } from "./audio.js";

// ------------------------------------------------------------
// element factory: el("div.foo", { id: "x" }, [child, "text"])
// ------------------------------------------------------------
export function el(tag, attrs = {}, children = []) {
  const [name, ...classes] = tag.split(".");
  const node = document.createElement(name || "div");
  if (classes.length) node.className = classes.join(" ");
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === "class") node.className += " " + v;
    else if (k === "style" && typeof v === "object") Object.assign(node.style, v);
    else if (k.startsWith("on") && typeof v === "function")
      node.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === "html") node.innerHTML = v;
    else if (k in node) {
      try { node[k] = v; } catch { node.setAttribute(k, v); }
    } else node.setAttribute(k, v);
  }
  const list = Array.isArray(children) ? children : [children];
  for (const c of list) {
    if (c == null || c === false) continue;
    node.appendChild(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return node;
}

// ------------------------------------------------------------
// toast — transient bottom message
// ------------------------------------------------------------
let toastTimer;
export function toast(msg, kind = "") {
  const t = document.getElementById("toast");
  if (!t) return;
  t.textContent = msg;
  t.className = "toast show " + kind;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (t.className = "toast"), 2400);
}

// ------------------------------------------------------------
// typing log — appends lines with optional typewriter effect
// ------------------------------------------------------------
export class TypingLog {
  constructor(host) {
    this.host = host;
    this.queue = [];
    this.running = false;
  }

  // line: { who?: string, text: string, tag?: "system"|"warn"|"error"|"ok", instant?: bool, delay?: ms }
  push(line) {
    this.queue.push(line);
    if (!this.running) this._tick();
  }

  pushMany(lines) { lines.forEach((l) => this.push(l)); }

  clear() {
    this.host.innerHTML = "";
    this.queue = [];
  }

  async _tick() {
    this.running = true;
    while (this.queue.length) {
      const line = this.queue.shift();
      await this._render(line);
    }
    this.running = false;
  }

  async _render({ who = "SYS", text, tag = "system", instant = false, delay = 220 }) {
    const lineEl = el("div.log__line.tag-" + tag);
    const whoEl = el("span.who", {}, [who]);
    const textEl = el("span", {});
    lineEl.appendChild(whoEl);
    lineEl.appendChild(textEl);
    this.host.appendChild(lineEl);
    this.host.scrollTop = this.host.scrollHeight;

    if (instant) {
      textEl.textContent = text;
    } else {
      textEl.classList.add("cursor");
      for (let i = 0; i < text.length; i++) {
        textEl.firstChild
          ? (textEl.firstChild.data = text.slice(0, i + 1))
          : textEl.appendChild(document.createTextNode(text[0]));
        if (i % 3 === 0) audio.tick();
        this.host.scrollTop = this.host.scrollHeight;
        await wait(16 + Math.random() * 22);
      }
      textEl.classList.remove("cursor");
    }
    await wait(delay);
  }
}

export function wait(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
