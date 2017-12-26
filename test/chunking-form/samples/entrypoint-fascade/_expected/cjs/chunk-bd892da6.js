'use strict';

var dep = 42;

function log (x) {
  if (dep) {
    console.log(x);
  }
}

exports.default = log;
exports.dep = dep;
