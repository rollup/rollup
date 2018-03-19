import { multiplier } from './chunk-909b409c.js';

function calc (num) {
  return num * multiplier;
}

function fn (num) {
  return num * calc(num);
}

console.log(fn(5));
