'use strict';

var external1 = require('external1');
require('external2');

console.log('shared');

Object.defineProperty(exports, "foo", {
	enumerable: true,
	get: function () { return external1.foo; }
});
