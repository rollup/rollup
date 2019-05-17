'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var external = require('external');
var external__default = _interopDefault(external);



Object.keys(external).forEach(function (key) {
	Object.defineProperty(exports, key, {
		enumerable: true,
		get: function () {
			return external[key];
		}
	});
});
exports.default = external__default;
