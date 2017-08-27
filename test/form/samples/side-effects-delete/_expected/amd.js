define(['exports'], function (exports) { 'use strict';

	var x = {foo: 'bar'};
	delete x.foo;

	delete globalVariable.foo;

	exports.x = x;

	Object.defineProperty(exports, '__esModule', { value: true });

});
