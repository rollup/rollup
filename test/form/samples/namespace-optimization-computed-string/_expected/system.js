System.register([], function () {
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
