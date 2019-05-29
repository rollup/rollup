System.register(['./generated-chunk.js'], function (exports) {
	'use strict';
	var v1;
	return {
		setters: [function (module) {
			v1 = module.v;
		}],
		execute: function () {

			var lazy = exports('default', () => v1);

		}
	};
});
