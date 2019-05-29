System.register(['./m2.js', './generated-chunk.js'], function () {
	'use strict';
	var ms;
	return {
		setters: [function () {}, function (module) {
			ms = module.a;
		}],
		execute: function () {

			console.log(ms);

		}
	};
});
