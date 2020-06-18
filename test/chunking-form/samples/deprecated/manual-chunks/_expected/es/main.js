import { f as fn$1, a as fn$2 } from './generated-deps2and3.js';
import './generated-lib1.js';

function fn () {
  console.log('dep1 fn');
}

class Main {
  constructor () {
    fn();
    fn$1();
    fn$2();
  }
}

export default Main;
