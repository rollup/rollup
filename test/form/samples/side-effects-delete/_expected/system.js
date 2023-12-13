System.register('myBundle', [], (function (exports) {
	'use strict';
	return {
		execute: (function () {

			var x = exports("x", {foo: 'bar'});
			delete x.foo;

			delete globalThis.unknown.foo;

		})
	};
}));
