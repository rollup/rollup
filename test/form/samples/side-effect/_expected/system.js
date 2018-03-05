System.register([], function (exports, module) {
	'use strict';
	return {
		execute: function () {

			var foo = 42;

			assert.equal( foo, 42 );

		}
	};
});
