System.register('myBundle', [], (function (exports) {
	'use strict';
	return {
		execute: (function () {

			exports("default", x);

			var augment;
			augment = y => y.augmented = true;

			function x () {}
			augment( x );

		})
	};
}));
