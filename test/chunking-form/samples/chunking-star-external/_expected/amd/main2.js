define(['exports', './generated-dep', 'external2', 'starexternal2'], function (exports, dep, external2, starexternal2) { 'use strict';

	var main = '2';

	Object.keys(starexternal2).forEach(function (k) {
		if (k !== 'default') Object.defineProperty(exports, k, {
			enumerable: true,
			get: function () {
				return starexternal2[k];
			}
		});
	});
	exports.dep = dep.dep;
	Object.defineProperty(exports, 'e', {
		enumerable: true,
		get: function () {
			return external2.e;
		}
	});
	exports.main = main;

	Object.defineProperty(exports, '__esModule', { value: true });

});
