'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var path = require('path');



Object.keys(path).forEach(function (key) {
	Object.defineProperty(exports, key, {
		enumerable: true,
		get: function () {
			return path[key];
		}
	});
});
Object.defineProperty(exports, 'isRelative', {
	enumerable: true,
	get: function () {
		return path.isRelative;
	}
});
