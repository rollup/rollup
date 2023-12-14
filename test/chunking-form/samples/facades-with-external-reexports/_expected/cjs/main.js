'use strict';

require('./other.js');
var external = require('external');



Object.defineProperty(exports, "foo", {
	enumerable: true,
	get: function () { return external.foo; }
});
