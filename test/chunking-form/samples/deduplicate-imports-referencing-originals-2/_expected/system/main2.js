System.register(['./generated-chunk.js'], function () {
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
