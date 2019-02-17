import { p as p$1 } from './main2.js';

class C {
  fn (num) {
    console.log(num - p$1);
  }
}

var p = 42;

new C().fn(p);

export { p };
