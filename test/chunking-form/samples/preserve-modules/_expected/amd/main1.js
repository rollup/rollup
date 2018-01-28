define(['./deps/dep1.js', './deps/dep2.js'], function (__deps_dep1_js, __deps_dep2_js) { 'use strict';

  class Main1 {
    constructor () {
      __deps_dep1_js.fn();
      __deps_dep2_js.fn();
    }
  }

  return Main1;

});
