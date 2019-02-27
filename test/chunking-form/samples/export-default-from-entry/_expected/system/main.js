System.register(['./dep.js'], function (exports, module) {
	'use strict';
	return {
		setters: [function (module) {
			exports('value', module.default);
		}],
		execute: function () {



		}
	};
});
