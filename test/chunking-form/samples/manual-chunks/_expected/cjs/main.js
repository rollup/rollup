'use strict';

var deps2and3 = require('./generated-deps2and3.js');
require('./generated-lib1.js');

function fn () {
  console.log('dep1 fn');
}

class Main {
  constructor () {
    fn();
    deps2and3.fn();
    deps2and3.fn$1();
  }
}

module.exports = Main;
