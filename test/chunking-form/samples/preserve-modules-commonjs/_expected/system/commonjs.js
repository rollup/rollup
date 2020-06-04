System.register(['external', './other.js'], function (exports) {
	'use strict';
	var external, other;
	return {
		setters: [function (module) {
			external = module.default;
		}, function (module) {
			other = module.default;
		}],
		execute: function () {

			const { value } = other;

			console.log(external, value);

			var commonjs = function (v) {exports({__moduleExports: commonjs, default: commonjs}); return v;} ( 42);

		}
	};
});
