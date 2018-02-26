System.register(['./head.js'], function (exports, module) {
	'use strict';
	return {
		setters: [function (module) {
			exports('default', module.default);
		}],
		execute: function () {



		}
	};
});
