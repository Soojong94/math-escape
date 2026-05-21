// ============================================================
// Room registry — 8 chapters, free entry order.
// To add a new room:
//   1) drop a module under js/rooms/<id>.js exporting a RoomModule
//   2) import + push it here in the order you want it to appear
// ============================================================

import { firewall }   from "./firewall.js";
import { mirror }     from "./mirror.js";
import { temple }     from "./temple.js";
import { casino }     from "./casino.js";
import { matrix }     from "./matrix.js";
import { eigen }      from "./eigen.js";
import { regression } from "./regression.js";
import { recursion }  from "./recursion.js";

export const rooms = [
  firewall,   // 01  combinatorics / lattice paths
  mirror,     // 02  sieve of Eratosthenes / twin primes
  temple,     // 03  Chinese remainder theorem
  casino,     // 04  Fermat / discrete log
  matrix,     // 05  determinants / linear maps
  eigen,      // 06  eigenvalues / eigenvectors
  regression, // 07  least squares / MSE
  recursion,  // 08  recurrence / Fibonacci
];
