'use strict';

var __deps_dep1_js = require('./deps/dep1.js');
var __deps_dep2_js = require('./deps/dep2.js');

class Main1 {
  constructor () {
    __deps_dep1_js.fn();
    __deps_dep2_js.fn();
  }
}

module.exports = Main1;
