System.register([], (function () {
	'use strict';
	return {
		execute: (function () {

			class Foo {
				foo() {
					console.log('foo');
				};
			}

			console.log(Foo);

		})
	};
}));
