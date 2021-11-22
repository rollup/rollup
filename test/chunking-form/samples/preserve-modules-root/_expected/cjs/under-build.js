'use strict';

require('./custom_modules/@my-scope/my-base-pkg/index.js');
var index = require('./_virtual/index.js_commonjs-exports.js');

const base = index.__exports;

var underBuild = {
	base
};

module.exports = underBuild;
