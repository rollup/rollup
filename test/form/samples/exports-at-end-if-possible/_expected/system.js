System.register('myBundle', [], (function (exports) {
	'use strict';
	return {
		execute: (function () {

			var FOO = exports("FOO", 'foo');

			console.log( FOO );
			console.log( FOO );
			console.log( FOO );

		})
	};
}));
