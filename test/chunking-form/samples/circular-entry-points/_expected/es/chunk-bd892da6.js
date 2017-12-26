import { p } from './main1.js';
import { p as p$1 } from './main2.js';

class C {
  fn (num) {
    console.log(num - p);
  }
}

class C$1 {
  fn (num) {
    console.log(num - p$1);
  }
}

export { C, C$1 };
