System.register(['./now.js', './date.default.js'], function (exports, module) {
	'use strict';
	return {
		setters: [function (module) {
			exports('now', module.default);
		}, function (module) {
			exports('default', module.default);
		}],
		execute: function () {



		}
	};
});
