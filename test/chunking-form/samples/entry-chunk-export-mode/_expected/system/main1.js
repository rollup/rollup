System.register(['./main2.js'], function (exports, module) {
	'use strict';
	var fn;
	return {
		setters: [function (module) {
			fn = module.default;
		}],
		execute: function () {

			fn();

		}
	};
});
