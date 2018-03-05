System.register([], function (exports, module) {
	'use strict';
	return {
		execute: function () {

			console.log( 1 );
			{
				var tmp = 10;
			}
			console.log( tmp );

		}
	};
});
