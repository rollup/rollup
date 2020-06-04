System.register([], function (exports) {
	'use strict';
	return {
		execute: function () {

			var value = exports('value', 43);

			var other = function (v) {exports({default: other, __moduleExports: other}); return v;} ( {
				value: value
			});

		}
	};
});
