'use strict';

var external2 = require('external2');
require('./main1.js');
require('external1');



Object.defineProperty(exports, "foo", {
	enumerable: true,
	get: function () { return external2.foo; }
});
