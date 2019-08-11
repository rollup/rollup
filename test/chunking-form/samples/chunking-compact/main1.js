import { fn } from './dep1.js';
import { fn as fn2 } from './dep2.js';

export default class Main1 {
  constructor () {
    fn();
    fn2();
  }
}