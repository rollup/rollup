System.register('myBundle', [], (function () {
	'use strict';
	return {
		execute: (function () {

			function foo () {
				throw new Error( 'throw side effect' );
			}

			foo();

		})
	};
}));
