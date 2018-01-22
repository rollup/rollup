import { fn as libfn } from './lib2.js';

export function fn () {
  libfn();
  console.log('dep2 fn');
}