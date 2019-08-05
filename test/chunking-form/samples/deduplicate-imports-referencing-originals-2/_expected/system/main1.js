System.register(['./generated-proxy2.js'], function () {
	'use strict';
	var bar;
	return {
		setters: [function (module) {
			bar = module.f;
		}],
		execute: function () {

			console.log(bar, bar);

		}
	};
});
