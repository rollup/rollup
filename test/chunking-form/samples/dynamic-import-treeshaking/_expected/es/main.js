import { a as multiplier } from './chunk-a3e957af.js';

function calc (num) {
  return num * multiplier;
}

function fn (num) {
  return num * calc(num);
}

console.log(fn(5));
