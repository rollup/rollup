'use strict';

var external = require('external');



Object.keys(external).forEach(function (k) {
	if (k !== 'default' && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
		enumerable: true,
		get: function () { return external[k]; }
	});
});
