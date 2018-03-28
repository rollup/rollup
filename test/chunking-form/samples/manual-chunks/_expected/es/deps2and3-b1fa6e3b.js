import { fn } from './lib1-9e470ebb.js';

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

export { fn$2 as fn, fn$3 as fn$1 };
