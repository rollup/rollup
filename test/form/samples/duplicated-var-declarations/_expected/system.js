System.register([], function (exports, module) {
	'use strict';
	return {
		execute: function () {

			var a = 1, b = 2;

			assert.equal( a, 1 );
			assert.equal( b, 2 );

			var a = 3, b = 4, c = 5;

			assert.equal( a, 3 );
			assert.equal( b, 4 );
			assert.equal( c, 5 );

		}
	};
});
