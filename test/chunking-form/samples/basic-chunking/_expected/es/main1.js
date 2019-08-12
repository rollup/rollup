import { f as fn$1 } from './generated-dep2.js';

function fn () {
  console.log('dep1 fn');
}

class Main1 {
  constructor () {
    fn();
    fn$1();
  }
}

export default Main1;
