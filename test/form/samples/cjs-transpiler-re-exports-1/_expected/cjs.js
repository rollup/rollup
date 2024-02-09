'use strict';

var foo_js = require('./foo.js');



Object.keys(foo_js).forEach(function (k) {
	if (k !== 'default' && !Object.prototype.hasOwnProperty.call(exports, k)) exports[k] = foo_js[k];
});
