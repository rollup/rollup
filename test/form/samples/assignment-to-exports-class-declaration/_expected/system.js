System.register('myModule', [], function (exports) {
	'use strict';
	return {
		execute: function () {

			let Foo = exports('Foo', class Foo {});
			Foo = exports('Foo', lol( Foo ));

		}
	};
});
