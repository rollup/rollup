System.register(['./generated-module3.js'], function () {
	'use strict';
	var b;
	return {
		setters: [function (module) {
			b = module.a;
		}],
		execute: function () {

			console.log(b, b);

		}
	};
});
