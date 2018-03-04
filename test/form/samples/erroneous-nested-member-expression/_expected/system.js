System.register([], function (exports, module) {
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
