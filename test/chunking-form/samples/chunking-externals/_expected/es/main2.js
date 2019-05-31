import { f as fn$3 } from './generated-chunk.js';
import { fn as fn$2 } from 'external';

function fn () {
  console.log('lib1 fn');
  fn$2();
}

function fn$1 () {
  fn();
  console.log('dep3 fn');
}

class Main2 {
  constructor () {
    fn$1();
    fn$3();
  }
}

export default Main2;
