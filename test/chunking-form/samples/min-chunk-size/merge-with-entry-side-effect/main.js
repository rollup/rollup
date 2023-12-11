import { s1 } from "./shared-1.js";

const { d1 } = import('./dynamic-1.js');
const { d2 } = import('./dynamic-2.js');

console.log(s1, d1, d2);
