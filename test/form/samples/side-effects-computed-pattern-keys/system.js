System.register([], function (exports, module) {
	'use strict';
	return {
		execute: function () {

			function foo () {}
			foo( globalFunction() );

			var baz = 2;
			foo( baz++ );

			assert.equal(baz, 3);

		}
	};
});
