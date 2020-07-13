'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var external = require('external');



Object.defineProperty(exports, 'p', {
	enumerable: true,
	get: function () {
		return external['default'];
	}
});
Object.defineProperty(exports, 'q', {
	enumerable: true,
	get: function () {
		return external.p;
	}
});
