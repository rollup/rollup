'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var external = require('external');

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex : { 'default': ex }; }

var external__default = _interopDefault(external);

console.log('main');

Object.defineProperty(exports, 'value', {
	enumerable: true,
	get: function () {
		return external__default['default'];
	}
});
