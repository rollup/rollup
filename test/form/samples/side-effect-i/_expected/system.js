System.register('myBundle', [], (function (exports) {
	'use strict';
	return {
		execute: (function () {

			if ( !ok ) {
				throw new Error( 'this will be included' );
			}

			var main = exports("default", 42);

		})
	};
}));
