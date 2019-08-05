'use strict';

var dep1 = require('./generated-chunk.js');

class Main1 {
  constructor () {
    dep1.fn();
  }
}

module.exports = Main1;
