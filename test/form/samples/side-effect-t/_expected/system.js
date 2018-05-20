System.register('myBundle', [], function (exports, module) {
	'use strict';
	return {
		execute: function () {

			function foo () {
				throw new Error( 'throw side effect' );
			}

			foo();

		}
	};
});
