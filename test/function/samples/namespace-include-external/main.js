import * as a from './dep.js';

const b = a;

export function test(names) {
  for (const name of names) {
    if (!(name in b)) {
      throw new Error(`Export ${name} not included`);
    }
  }
}
