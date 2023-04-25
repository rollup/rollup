System.register(['./_virtual/_commonjsHelpers.js', 'external', './other.js', './_virtual/other.js'], (function (exports) {
	'use strict';
	var getDefaultExportFromCjs, require$$0, other;
	return {
		setters: [function (module) {
			getDefaultExportFromCjs = module.getDefaultExportFromCjs;
		}, function (module) {
			require$$0 = module.default;
		}, null, function (module) {
			other = module.__exports;
		}],
		execute: (function () {

			const external = require$$0;
			const { value } = other;

			console.log(external, value);

			var commonjs = 42;

			var value$1 = exports('default', /*@__PURE__*/getDefaultExportFromCjs(commonjs));

		})
	};
}));
