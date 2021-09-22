System.register([], (function () {
	'use strict';
	return {
		execute: (function () {

			function x () { return 'x' }
			assert.equal( x(), 'x' );

		})
	};
}));
