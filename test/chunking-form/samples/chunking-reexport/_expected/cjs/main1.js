'use strict';

var external = require('external');

console.log('dep');

Object.defineProperty(exports, "dep", {
	enumerable: true,
	get: function () { return external.asdf; }
});
