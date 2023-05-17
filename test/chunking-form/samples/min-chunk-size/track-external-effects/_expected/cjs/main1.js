'use strict';

var external1 = require('external1');
require('./generated-shared.js');



Object.defineProperty(exports, 'foo', {
	enumerable: true,
	get: function () { return external1.foo; }
});
