'use strict';

var __chunk1_js = require('./chunk1.js');

function fn () {
  console.log('dep1 fn');
}

class Main1 {
  constructor () {
    fn();
    __chunk1_js.fn();
  }
}

module.exports = Main1;
//# sourceMappingURL=./main1.js.map
