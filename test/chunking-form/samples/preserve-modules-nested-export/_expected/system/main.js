System.register(['./inner/more_inner/something.js', './inner/some_effect.js'], function (exports, module) {
	'use strict';
	return {
		setters: [function (module) {
			exports('Something', module.Something);
		}, function () {}],
		execute: function () {



		}
	};
});
