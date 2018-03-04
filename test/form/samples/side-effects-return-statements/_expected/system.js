System.register([], function (exports, module) {
	'use strict';
	return {
		execute: function () {

			function isUsed ( x ) {
				if ( x ) {
					return 2;
				}
				return 1;
			}

			assert.equal( isUsed( true ), 2 );

		}
	};
});
