System.register([], function (exports, module) {
	'use strict';
	return {
		execute: function () {

			async function foo () {
				return 'foo';
			}

			foo().then( value => console.log( value ) );

		}
	};
});
