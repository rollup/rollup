System.register(['./chunks/shared.js'], function (exports) {
	'use strict';
	return {
		setters: [function (module) {
			exports('sharedValue', module.s);
		}],
		execute: function () {



		}
	};
});
