var bundle = (function (exports, myExternal) {
	'use strict';

	const test = () => myExternal;

	const someDynamicImport = () => import('external');

	exports.someDynamicImport = someDynamicImport;
	exports.test = test;

	return exports;

})({}, myExternal);
