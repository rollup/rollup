import { fn } from './deps/dep1.js';
import { fn as fn2 } from './deps/dep2.js';

export default class Main1 {
  constructor () {
    fn();
    fn2();
  }
}