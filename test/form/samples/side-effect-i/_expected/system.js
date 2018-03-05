System.register([], function (exports, module) {
	'use strict';
	return {
		execute: function () {

			if ( !ok ) {
				throw new Error( 'this will be included' );
			}

			var main = exports('default', 42);

		}
	};
});
