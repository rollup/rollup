import { a as fn, b as fn$1 } from './generated-deps2and3.js';
import './generated-lib1.js';

function fn$2 () {
  console.log('dep1 fn');
}

class Main {
  constructor () {
    fn$2();
    fn();
    fn$1();
  }
}

export default Main;
