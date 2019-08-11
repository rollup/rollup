import { fn as libfn } from './lib1.js';

export function fn () {
  libfn();
  console.log('dep3 fn');
}