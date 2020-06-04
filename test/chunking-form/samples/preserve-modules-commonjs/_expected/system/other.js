System.register([], function (exports) {
	'use strict';
	return {
		execute: function () {

			var value = exports('value', 43);

			var other = function (v) {exports({__moduleExports: other, default: other}); return v;} ( {
				value: value
			});

		}
	};
});
