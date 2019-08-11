System.register(['./two.js'], function () {
	'use strict';
	var a;
	return {
		setters: [function (module) {
			a = module.default;
		}],
		execute: function () {

			window.APP = { a };

		}
	};
});
