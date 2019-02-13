System.register('bundle', [], function (exports, module) {
	'use strict';
	return {
		execute: function () {

			const module = {
				exports: 99
			};
			console.log(module);

			var main = exports('default', 42);

		}
	};
});
