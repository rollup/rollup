import g from "./g.js";
export default function (fn) {
  return function (str) { return str || g(fn.name); }
}
