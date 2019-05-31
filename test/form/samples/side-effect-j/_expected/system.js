System.register('myBundle', [], function (exports) {
	'use strict';
	return {
		execute: function () {

			exports('default', x);

			var augment;
			augment = x => x.augmented = true;

			function x () {}
			augment( x );

		}
	};
});
