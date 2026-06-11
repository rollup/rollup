'use strict';

var libHooksA = require('lib-hooks-a');
var libHooksB = require('lib-hooks-b');



Object.defineProperty(exports, "hooksA", {
	enumerable: true,
	get: function () { return libHooksA.hooksA; }
});
Object.defineProperty(exports, "hooksB", {
	enumerable: true,
	get: function () { return libHooksB.hooksB; }
});
