// ============================================================
// Room registry
// Add a new room: import it and push to `rooms` in order.
// Room module shape:
//   {
//     id, order, title, tag, concept,
//     hints: [{ label, text }],
//     implemented: true,
//     successLine: "...",
//     mount(api) { ... }
//   }
// ============================================================

import { firewall } from "./firewall.js";
import { mirror } from "./mirror.js";
import { temple } from "./temple.js";
import { casino } from "./casino.js";

export const rooms = [firewall, mirror, temple, casino];
