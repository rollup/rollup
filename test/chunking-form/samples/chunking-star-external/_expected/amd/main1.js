define(['exports', 'starexternal1', 'external1', './generated-dep', 'starexternal2', 'external2'], function (exports, starexternal1, external1, dep, starexternal2, external2) { 'use strict';

	var main = '1';

	Object.keys(starexternal1).forEach(function (k) {
		if (k !== 'default') Object.defineProperty(exports, k, {
			enumerable: true,
			get: function () {
				return starexternal1[k];
			}
		});
	});
	Object.defineProperty(exports, 'e', {
		enumerable: true,
		get: function () {
			return external1.e;
		}
	});
	exports.dep = dep.dep;
	exports.main = main;

	Object.defineProperty(exports, '__esModule', { value: true });

});
