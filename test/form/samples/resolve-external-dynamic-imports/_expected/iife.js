var bundle = (function (exports, myExternal) {
	'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

	var myExternal__default = /*#__PURE__*/_interopDefaultLegacy(myExternal);

	const test = () => myExternal__default["default"];

	const someDynamicImport = () => import('external');

	exports.someDynamicImport = someDynamicImport;
	exports.test = test;

	Object.defineProperty(exports, '__esModule', { value: true });

	return exports;

})({}, myExternal);
