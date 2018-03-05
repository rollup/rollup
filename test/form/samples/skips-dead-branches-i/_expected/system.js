System.register([], function (exports, module) {
	'use strict';
	return {
		execute: function () {

			function baz() {
				console.log("baz");
			}
			baz();

		}
	};
});
