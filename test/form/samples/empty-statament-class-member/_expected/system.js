System.register([], (function (exports) {
	'use strict';
	return {
		execute: (function () {

			class Foo {
				foo() {
					console.log(3);
				}
			} exports('Foo', Foo);

		})
	};
}));
