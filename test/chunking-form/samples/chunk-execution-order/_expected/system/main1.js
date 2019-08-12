System.register(['./generated-dep111.js', './generated-dep112.js', './generated-dep11.js'], function () {
	'use strict';
	var x;
	return {
		setters: [function () {}, function (module) {
			x = module.x;
		}, function () {}],
		execute: function () {

			console.log('1');

			console.log(x);

		}
	};
});
