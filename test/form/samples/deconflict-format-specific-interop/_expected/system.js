System.register(['external'], function (exports, module) {
	'use strict';
	var external;
	return {
		setters: [function (module) {
			external = module.default;
		}],
		execute: function () {

			const _interopDefault = 42;
			console.log(external, _interopDefault);

		}
	};
});
