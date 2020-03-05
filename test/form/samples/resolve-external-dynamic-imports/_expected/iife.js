var bundle = (function (exports, myExternal) {
	'use strict';

	myExternal = myExternal && Object.prototype.hasOwnProperty.call(myExternal, 'default') ? myExternal['default'] : myExternal;

	const test = () => myExternal;

	const someDynamicImport = () => import('external');

	exports.someDynamicImport = someDynamicImport;
	exports.test = test;

	return exports;

}({}, myExternal));
