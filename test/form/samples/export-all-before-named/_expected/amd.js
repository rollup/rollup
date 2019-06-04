define(['exports', 'path'], function (exports, path) { 'use strict';



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

	Object.defineProperty(exports, '__esModule', { value: true });

});
