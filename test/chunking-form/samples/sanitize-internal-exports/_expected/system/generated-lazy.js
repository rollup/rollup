System.register(['./generated-chunk.js'], function (exports, module) {
	'use strict';
	var v1;
	return {
		setters: [function (module) {
			v1 = module.a;
		}],
		execute: function () {

			var lazy = exports('default', () => v1);

		}
	};
});
