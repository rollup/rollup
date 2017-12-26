import { multiplier } from './chunk-36864708.js';

function calc (num) {
  return num * multiplier;
}

function fn (num) {
  return num * calc(num);
}

console.log(fn(5));
