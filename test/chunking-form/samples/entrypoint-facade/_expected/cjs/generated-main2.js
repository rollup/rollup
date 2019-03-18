'use strict';

var dep = { x: 42 };

function log (x) {
  if (dep) {
    console.log(x);
  }
}

exports.dep = dep;
exports.log = log;
