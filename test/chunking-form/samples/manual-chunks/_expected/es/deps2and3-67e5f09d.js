import { a as fn } from './lib1-a9a3a51f.js';

function fn$1 () {
  console.log('lib2 fn');
}

function fn$2 () {
  fn$1();
  console.log('dep2 fn');
}

function fn$3 () {
  fn();
  console.log('dep3 fn');
}

export { fn$2 as a, fn$3 as b };
