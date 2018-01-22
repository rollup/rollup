import { p } from './main1.js';

class C {
  fn (num) {
    console.log(num - p);
  }
}

var p$1 = 43;

new C().fn(p$1);

export { p$1 as p };
