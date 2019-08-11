'use strict';

var dep2 = require('./generated-dep2.js');

function fn () {
  console.log('dep1 fn');
}

class Main1 {
  constructor () {
    fn();
    dep2.fn();
  }
}

module.exports = Main1;
//# sourceMappingURL=main1.js.map
