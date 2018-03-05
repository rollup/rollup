System.register([], function (exports, module) {
	'use strict';
	return {
		execute: function () {

			function a () {
				console.log('effect');
			}

			a();

		}
	};
});
