import { p } from './main2.js';

class C {
  fn (num) {
    console.log(num - p);
  }
}

var p$1 = 42;

new C().fn(p$1);

export { p$1 as p };
