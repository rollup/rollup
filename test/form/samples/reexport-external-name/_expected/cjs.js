'use strict';

var external1 = require('external1');
var external2 = require('external2');



Object.defineProperty(exports, "foo", {
	enumerable: true,
	get: function () { return external1.foo; }
});
Object.defineProperty(exports, "bar", {
	enumerable: true,
	get: function () { return external2.foo; }
});
