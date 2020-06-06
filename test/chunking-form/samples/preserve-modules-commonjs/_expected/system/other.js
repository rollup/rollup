System.register([], function (exports) {
	'use strict';
	return {
		execute: function () {

			var value = exports('value', 43);

			var other = function (v) { return exports({ default: v, __moduleExports: v }), v; }({
				value: value
			});

		}
	};
});
