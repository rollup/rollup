System.register([], function (exports, module) {
	'use strict';
	return {
		execute: function () {

			function x () { return 'x' }
			assert.equal( x(), 'x' );

		}
	};
});
