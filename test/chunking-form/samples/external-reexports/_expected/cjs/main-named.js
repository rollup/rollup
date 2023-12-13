'use strict';

var externalAll = require('external-all');
var externalNamed = require('external-named');
var externalDefaultNamed = require('external-default-named');
var externalNamedNamespace = require('external-named-namespace');



Object.defineProperty(exports, "foo", {
	enumerable: true,
	get: function () { return externalAll.foo; }
});
Object.defineProperty(exports, "bar", {
	enumerable: true,
	get: function () { return externalNamed.bar; }
});
Object.defineProperty(exports, "baz", {
	enumerable: true,
	get: function () { return externalDefaultNamed.baz; }
});
Object.defineProperty(exports, "quux", {
	enumerable: true,
	get: function () { return externalNamedNamespace.quux; }
});
