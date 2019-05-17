System.register(['external', './other.js', './_virtual/_external_commonjs-external', './_virtual/other.js_commonjs-proxy'], function (exports, module) {
	'use strict';
	var external, require$$0;
	return {
		setters: [function () {}, function () {}, function (module) {
			external = module.default;
		}, function (module) {
			require$$0 = module.default;
		}],
		execute: function () {

			const { value } = require$$0;

			console.log(external, value);

			var commonjs = exports('__moduleExports', 42);
			exports('default', commonjs);

		}
	};
});
