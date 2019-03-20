define(['require', 'exports', 'external'], function (require, exports, myExternal) { 'use strict';

	myExternal = myExternal && myExternal.hasOwnProperty('default') ? myExternal['default'] : myExternal;

	const test = () => myExternal;

	const someDynamicImport = () => new Promise(function (resolve, reject) { require(['external'], resolve, reject) });

	exports.someDynamicImport = someDynamicImport;
	exports.test = test;

	Object.defineProperty(exports, '__esModule', { value: true });

});
