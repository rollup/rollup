import { fn } from './dep2.js';
import { fn as fn2 } from './dep3.js';

export default class Main2 {
  constructor () {
    fn2();
    fn();
  }
}