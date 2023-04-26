'use strict';

var _commonjsHelpers = require('../_virtual/_commonjsHelpers.js');
require('../custom_modules/@my-scope/my-base-pkg/index.js');
var index = require('../_virtual/index.js');

const base2 = index.__exports;

var module$1 = {
  base2,
};

var module$2 = /*@__PURE__*/_commonjsHelpers.getDefaultExportFromCjs(module$1);

module.exports = module$2;
