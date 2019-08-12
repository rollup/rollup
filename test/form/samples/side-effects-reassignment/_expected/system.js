System.register([], function () {
	'use strict';
	return {
		execute: function () {

			var effect = function() {
				console.log('effect');
			};

			var alsoEffect = effect;
			alsoEffect();

		}
	};
});
