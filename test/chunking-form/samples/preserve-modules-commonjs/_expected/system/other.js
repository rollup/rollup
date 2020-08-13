System.register([], function (exports) {
	'use strict';
	return {
		execute: function () {

			var value = exports('value', 43);

			var other = exports('default', {
				value: value
			});

		}
	};
});
