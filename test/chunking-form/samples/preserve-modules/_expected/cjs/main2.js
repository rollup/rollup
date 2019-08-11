'use strict';

var dep2 = require('./deps/dep2.js');
var dep3 = require('./deps/dep3.js');

class Main2 {
  constructor () {
    dep3.fn();
    dep2.fn();
  }
}

module.exports = Main2;
