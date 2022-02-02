define(['external', './other', './_virtual/other'], (function (require$$0, other$1, other) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

	var require$$0__default = /*#__PURE__*/_interopDefaultLegacy(require$$0);

	const external = require$$0__default["default"];
	const { value } = other.__exports;

	console.log(external, value);

	var commonjs = 42;

	return commonjs;

}));
