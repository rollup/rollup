import { f as fn$2 } from './generated-dep2.js';

function fn$1 () {
  console.log('lib1 fn');
}

function fn () {
  fn$1();
  console.log('dep3 fn');
}

class Main2 {
  constructor () {
    fn();
    fn$2();
  }
}

export default Main2;
