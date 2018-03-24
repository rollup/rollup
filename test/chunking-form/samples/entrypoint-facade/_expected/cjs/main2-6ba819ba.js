'use strict';

var dep = { x: 42 }

function log (x) {
  if (dep) {
    console.log(x);
  }
}

exports.default = log;
exports.dep = dep;
