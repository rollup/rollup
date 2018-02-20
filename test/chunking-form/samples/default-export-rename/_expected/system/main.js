System.register(['./dep.js'], function (exports, module) {
	'use strict';
	var renamed;
	return {
		setters: [function (module) {
			renamed = module.default;
		}],
		execute: function () {

			name();

		}
	};
});
