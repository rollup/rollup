'use strict';

var _commonjsHelpers = require('./_virtual/_commonjsHelpers.js');
require('./custom_modules/@my-scope/my-base-pkg/index.js');
var index = require('./_virtual/index.js');

const base = index.__exports;

var underBuild = {
	base
};

var underBuild$1 = /*@__PURE__*/_commonjsHelpers.getDefaultExportFromCjs(underBuild);

module.exports = underBuild$1;
