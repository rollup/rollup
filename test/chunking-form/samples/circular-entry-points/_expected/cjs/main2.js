'use strict';

let C$1 = class C {
  fn (num) {
    console.log(num - p);
  }
};

var p$1 = 43;

new C$1().fn(p$1);

class C {
  fn (num) {
    console.log(num - p$1);
  }
}

var p = 42;

new C().fn(p);

exports.p = p$1;
exports.p$1 = p;
