System.register([], function (exports, module) {
	'use strict';
	return {
		execute: function () {

			function bar () {
				console.log( 'this should be included' );
			}
			bar();

		}
	};
});
