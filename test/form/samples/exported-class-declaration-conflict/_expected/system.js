System.register('bundle', [], (function (exports) {
	'use strict';
	return {
		execute: (function () {

			let Foo$1 = class Foo {}; exports("First", Foo$1);

			class Foo {} exports("Second", Foo);

		})
	};
}));
