var bundle = (function (exports, myExternal) {
	'use strict';

	function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

	myExternal = _interopDefault(myExternal);

	const test = () => myExternal;

	const someDynamicImport = () => import('external');

	exports.someDynamicImport = someDynamicImport;
	exports.test = test;

	return exports;

}({}, myExternal));
