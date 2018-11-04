define(['require', 'exports', 'external'], function (require, exports, myExternal) { 'use strict';

	myExternal = myExternal && myExternal.hasOwnProperty('default') ? myExternal['default'] : myExternal;

	const test = () => myExternal;

	const someDynamicImport = () => new Promise(function (resolve, reject) { require(['external'], resolve, reject) });

	exports.test = test;
	exports.someDynamicImport = someDynamicImport;

	Object.defineProperty(exports, '__esModule', { value: true });

});
