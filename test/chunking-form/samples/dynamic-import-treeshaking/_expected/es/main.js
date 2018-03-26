import { a as multiplier } from './chunk-713732d9.js';

function calc (num) {
  return num * multiplier;
}

function fn (num) {
  return num * calc(num);
}

console.log(fn(5));
