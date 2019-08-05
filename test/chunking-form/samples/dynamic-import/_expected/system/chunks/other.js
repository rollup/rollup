System.register(['./shared.js'], function (exports) {
	'use strict';
	return {
		setters: [function (module) {
			exports('value', module.s);
		}],
		execute: function () {



		}
	};
});
