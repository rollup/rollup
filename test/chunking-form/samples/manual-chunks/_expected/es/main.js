import { a as fn, b as fn$1 } from './deps2and3-67e5f09d.js';
import './lib1-a9a3a51f.js';

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
