System.register([], (function () {
	'use strict';
	return {
		execute: (function () {

			class Foo {
				constructor() {
					console.log(new.target.name);
				}
			}

			new Foo();

		})
	};
}));
