var bundle = (function (exports, myExternal) {
	'use strict';

	const test = () => myExternal;

	const someDynamicImport = () => import('external');

	exports.someDynamicImport = someDynamicImport;
	exports.test = test;

	Object.defineProperty(exports, '__esModule', { value: true });

	return exports;

})({}, myExternal);
