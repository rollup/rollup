'use strict';

var dep1 = require('./generated-dep1.js');

class Main1 {
  constructor () {
    dep1.fn();
  }
}

module.exports = Main1;
