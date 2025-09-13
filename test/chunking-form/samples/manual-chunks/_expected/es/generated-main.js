import { f as fn$2, a as fn$3 } from './generated-deps2and3.js';

function fn$1 () {
  console.log('dep1 fn');
}

function fn () {
  console.log('lib2 fn');
}

class Main {
  constructor () {
    fn$1();
    fn$2();
    fn$3();
  }
}

export { Main as M, fn as f };
