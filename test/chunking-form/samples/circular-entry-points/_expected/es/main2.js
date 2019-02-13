import { p as p$1 } from './main1.js';

class C {
  fn (num) {
    console.log(num - p$1);
  }
}

var p = 43;

new C().fn(p);

export { p };
