import { a as fn$2 } from './generated-chunk.js';

function fn () {
  console.log('lib1 fn');
}

function fn$1 () {
  fn();
  console.log('dep3 fn');
}

class Main2 {
  constructor () {
    fn$1();
    fn$2();
  }
}

export default Main2;
