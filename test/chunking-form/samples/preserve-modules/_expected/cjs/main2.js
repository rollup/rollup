'use strict';

var __deps_dep2_js = require('./deps/dep2.js');
var __deps_dep3_js = require('./deps/dep3.js');
require('./lib/lib2.js');
require('./lib/lib1.js');

class Main2 {
  constructor () {
    __deps_dep3_js.fn();
    __deps_dep2_js.fn();
  }
}

module.exports = Main2;
