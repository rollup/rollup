import { fn } from './deps/dep1.js';
import { fn as fn$1 } from './deps/dep2.js';
import './lib/lib2.js';

class Main1 {
  constructor () {
    fn();
    fn$1();
  }
}

export default Main1;
