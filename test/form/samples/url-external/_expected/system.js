System.register(['https://external.com/external.js'], function (exports, module) {
	'use strict';
	var external;
	return {
		setters: [function (module) {
			external = module.default;
		}],
		execute: function () {

			console.log(external);

		}
	};
});
