import { fn, fn$1 } from './deps2and3-b1fa6e3b.js';
import './lib1-9e470ebb.js';

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
