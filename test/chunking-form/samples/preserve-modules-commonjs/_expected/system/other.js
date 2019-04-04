System.register([], function (exports, module) {
	'use strict';
	return {
		execute: function () {

			var value = exports('value', 43);

			var other = exports('__moduleExports', {
				value: value
			});

		}
	};
});
