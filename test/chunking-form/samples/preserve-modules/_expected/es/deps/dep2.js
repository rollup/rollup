import { fn } from '../lib/lib2.js';

function fn$1 () {
  fn();
  console.log('dep2 fn');
}

export { fn$1 as fn };
