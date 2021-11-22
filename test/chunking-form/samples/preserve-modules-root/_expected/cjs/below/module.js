'use strict';

require('../custom_modules/@my-scope/my-base-pkg/index.js');
var index = require('../_virtual/index.js_commonjs-exports.js');

const base2 = index.__exports;

var module$1 = {
  base2,
};

module.exports = module$1;
