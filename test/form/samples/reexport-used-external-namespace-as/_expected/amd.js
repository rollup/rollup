define(['exports', 'external1', 'external2'], function (exports, imported1, external2) { 'use strict';

	console.log(imported1, external2.imported2);

	exports.external1 = imported1;
	exports.external2 = external2;

	Object.defineProperty(exports, '__esModule', { value: true });

});
