System.register([], function (exports, module) {
	'use strict';
	return {
		execute: function () {

			var a = 1;

			var e = 5;

			var i = 9;

			assert.equal( a, 1 );
			assert.equal( e, 5 );
			assert.equal( i, 9 );

		}
	};
});
