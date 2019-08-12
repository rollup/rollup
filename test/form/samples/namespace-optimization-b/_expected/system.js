System.register([], function () {
	'use strict';
	return {
		execute: function () {

			function foo () {
				console.log( 'foo' );
			}

			function a () {
				foo();
				foo();

				var a;
				if ( a.b ) ;
			}

			a();

		}
	};
});
