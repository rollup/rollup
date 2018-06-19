System.register(['external'], function (exports, module) {
	'use strict';
	var bar;
	return {
		setters: [function (module) {
			bar = module.bar;
		}],
		execute: function () {

			if (bar) {
				console.log(true);
			}

			var foo = exports('default', 1);

		}
	};
});
