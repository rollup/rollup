define(['./_virtual/_commonjsHelpers', 'external', './other', './_virtual/other'], (function (_commonjsHelpers, require$$0, other$1, other) { 'use strict';

	const external = require$$0;
	const { value } = other.__exports;

	console.log(external, value);

	var commonjs = 42;

	var value$1 = /*@__PURE__*/_commonjsHelpers.getDefaultExportFromCjs(commonjs);

	return value$1;

}));
