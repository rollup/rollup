'use strict';

require('./generated-dep.js');
var external = require('external');



Object.defineProperty(exports, 'dep', {
	enumerable: true,
	get: function () { return external.asdf; }
});
