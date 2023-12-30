'use strict';

var external = require('external');

function a () {}
function b () {}

Object.defineProperty(exports, "'x", {
	enumerable: true,
	get: function () { return external.x; }
});
exports["'a"] = a;
exports["'b"] = b;
