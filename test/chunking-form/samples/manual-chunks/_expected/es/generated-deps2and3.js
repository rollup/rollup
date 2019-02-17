import { a as fn$3 } from './generated-lib1.js';

function fn () {
  console.log('lib2 fn');
}

function fn$1 () {
  fn();
  console.log('dep2 fn');
}

function fn$2 () {
  fn$3();
  console.log('dep3 fn');
}

export { fn$1 as a, fn$2 as b };
