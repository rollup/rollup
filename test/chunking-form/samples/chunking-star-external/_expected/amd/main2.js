define(['exports', 'starexternal2', 'external2', './generated-chunk.js'], function (exports, starexternal2, external2, __chunk_1) { 'use strict';

	var main = '2';

	Object.keys(starexternal2).forEach(function (key) {
		Object.defineProperty(exports, key, {
			enumerable: true,
			get: function () {
				return starexternal2[key];
			}
		});
	});
	Object.defineProperty(exports, 'e', {
		enumerable: true,
		get: function () {
			return external2.e;
		}
	});
	exports.dep = __chunk_1.dep;
	exports.main = main;

	Object.defineProperty(exports, '__esModule', { value: true });

});
