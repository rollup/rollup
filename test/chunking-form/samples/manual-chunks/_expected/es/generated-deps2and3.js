import { f as fn$3 } from './generated-lib1.js';

function fn$2 () {
  console.log('lib2 fn');
}

function fn$1 () {
  fn$2();
  console.log('dep2 fn');
}

function fn () {
  fn$3();
  console.log('dep3 fn');
}

export { fn as a, fn$1 as f };
