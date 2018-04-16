System.register(['./two.js'], function (exports, module) {
	'use strict';
	return {
		setters: [function (module) {
			exports('a', module.default);
		}],
		execute: function () {



		}
	};
});
