'use strict';

var foo_js = require('./foo.js');



Object.prototype.hasOwnProperty.call(foo_js, '__proto__') &&
	!Object.prototype.hasOwnProperty.call(exports, '__proto__') &&
	Object.defineProperty(exports, '__proto__', {
		enumerable: true,
		value: foo_js['__proto__']
	});

Object.keys(foo_js).forEach(function (k) {
	if (k !== 'default' && !Object.prototype.hasOwnProperty.call(exports, k)) exports[k] = foo_js[k];
});
