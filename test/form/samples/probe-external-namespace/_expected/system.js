System.register(['external'], function () {
	'use strict';
	var external;
	return {
		setters: [function (module) {
			external = module;
		}],
		execute: function () {

			console.log(external.default, external.foo);

		}
	};
});
