define(['exports'], function (exports) { 'use strict';

	exports.Foo = class Foo {}
	exports.Foo = lol( exports.Foo );

	Object.defineProperty(exports, '__esModule', { value: true });

});
