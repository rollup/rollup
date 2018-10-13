var bundle = (function (exports,myExternal) {
	'use strict';

	myExternal = myExternal && myExternal.hasOwnProperty('default') ? myExternal['default'] : myExternal;

	const test = () => myExternal;

	const someDynamicImport = () => import('external');

	exports.test = test;
	exports.someDynamicImport = someDynamicImport;

	return exports;

}({},myExternal));
