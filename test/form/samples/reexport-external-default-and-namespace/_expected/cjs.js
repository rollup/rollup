'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var external = require('external');

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex : { 'default': ex }; }

var external__default = /*#__PURE__*/_interopDefault(external);



Object.keys(external).forEach(function (k) {
	if (k !== 'default') Object.defineProperty(exports, k, {
		enumerable: true,
		get: function () {
			return external[k];
		}
	});
});
Object.defineProperty(exports, 'default', {
	enumerable: true,
	get: function () {
		return external__default['default'];
	}
});
