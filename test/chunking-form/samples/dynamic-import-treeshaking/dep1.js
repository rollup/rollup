import { calc } from './dep3.js';

export function fn (num) {
  return num * calc(num);
}

export function dynamic (num) {
  return import('./dep2.js')
  .then(dep2 => {
    return dep2.mult(num);
  });
}