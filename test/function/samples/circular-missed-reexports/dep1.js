export * from './dep2.js';
export { exists1 as exists } from './dep2.js';
export { exists3 as exists2 } from './dep1.js';
export { exists4 as exists3 } from './dep2.js';
export const exists4 = 42;
