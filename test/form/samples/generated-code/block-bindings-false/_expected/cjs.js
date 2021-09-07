'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var foo = require('external');

var _interopDefaultLegacy = e => e && typeof e === 'object' && 'default' in e ? e : { 'default': e };

var foo__default = /*#__PURE__*/_interopDefaultLegacy(foo);

console.log(foo__default["default"]);

Object.keys(foo).forEach(k => {
	if (k !== 'default' && !exports.hasOwnProperty(k)) Object.defineProperty(exports, k, {
		enumerable: true,
		get: () => foo[k]
	});
});
