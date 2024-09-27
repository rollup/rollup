System.register(['external', './other.js'], (function (exports) {
	'use strict';
	var require$$0, requireOther;
	return {
		setters: [function (module) {
			require$$0 = module.default;
		}, function (module) {
			requireOther = module.__require;
		}],
		execute: (function () {

			exports("__require", requireCommonjs);

			var commonjs;
			var hasRequiredCommonjs;

			function requireCommonjs () {
				if (hasRequiredCommonjs) return commonjs;
				hasRequiredCommonjs = 1;
				const external = require$$0;
				const { value } = requireOther();

				console.log(external, value);

				commonjs = 42;
				return commonjs;
			}

		})
	};
}));
