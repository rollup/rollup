import { fn } from 'external';
import { fn as fn$1 } from './chunk.js';

function fn$2 () {
  console.log('lib1 fn');
  fn();
}

function fn$3 () {
  fn$2();
  console.log('dep3 fn');
}

class Main2 {
  constructor () {
    fn$3();
    fn$1();
  }
}

export default Main2;
