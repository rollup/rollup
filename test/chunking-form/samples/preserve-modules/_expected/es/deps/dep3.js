import { fn } from '../lib/lib1.js';

function fn$1 () {
  fn();
  console.log('dep3 fn');
}

export { fn$1 as fn };
