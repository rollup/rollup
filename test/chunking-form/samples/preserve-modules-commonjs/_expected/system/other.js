System.register(['./_virtual/other.js'], (function (exports) {
	'use strict';
	var other;
	return {
		setters: [function (module) {
			other = module.__exports;
		}],
		execute: (function () {

			exports("__require", requireOther);

			var hasRequiredOther;

			function requireOther () {
				if (hasRequiredOther) return other;
				hasRequiredOther = 1;
				other.value = 43;
				return other;
			}

		})
	};
}));
