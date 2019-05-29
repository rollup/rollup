System.register([], function () {
	'use strict';
	return {
		execute: function () {

			function yar() {
				return {
					har() {
						console.log('har?');
					}
				};
			}

			yar.har();

		}
	};
});
