'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var external = require('external');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { default: e }; }

var external__default = /*#__PURE__*/_interopDefaultLegacy(external);

console.log(external.value);

Object.defineProperty(exports, 'reexported', {
	enumerable: true,
	get: function () { return external__default.default; }
});
