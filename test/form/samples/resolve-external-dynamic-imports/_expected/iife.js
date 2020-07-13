var bundle = (function (exports, myExternal) {
	'use strict';

	function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex : { 'default': ex }; }

	var myExternal__default = _interopDefault(myExternal);

	const test = () => myExternal__default['default'];

	const someDynamicImport = () => import('external');

	exports.someDynamicImport = someDynamicImport;
	exports.test = test;

	return exports;

}({}, myExternal));
