System.register('myBundle', [], (function (exports) {
	'use strict';
	return {
		execute: (function () {

			function foo ( ok ) {
				if ( !ok ) {
					throw new Error( 'this will be ignored' );
				}
			}

			foo();

			var main = exports("default", 42);

		})
	};
}));
