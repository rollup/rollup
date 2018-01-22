define(['exports', './chunk1.js', 'external2', 'starexternal2'], function (exports, __chunk1_js, external2, starexternal2) { 'use strict';

	var main = '2';

	Object.keys(starexternal2).forEach(function (key) { exports[key] = starexternal2[key]; });
	exports.dep = __chunk1_js.dep;
	exports.e = external2.e;
	exports.main = main;

	Object.defineProperty(exports, '__esModule', { value: true });

});
