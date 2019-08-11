'use strict';

var dep1 = require('./generated-dep1.js');

class Main2 {
  constructor () {
    dep1.fn$1();
  }
}

module.exports = Main2;
