'use strict';

var dep1 = require('./deps/dep1.js');
var dep2 = require('./deps/dep2.js');

class Main1 {
  constructor () {
    dep1.fn();
    dep2.fn();
  }
}

module.exports = Main1;
