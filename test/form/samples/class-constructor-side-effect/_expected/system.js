System.register([], function (exports, module) {
	'use strict';
	return {
		execute: function () {

			class Foo {
				constructor () {
					console.log( 'Foo' );
				}
			}

			new Foo;

		}
	};
});
