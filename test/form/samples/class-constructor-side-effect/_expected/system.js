System.register([], function () {
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
