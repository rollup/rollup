System.register(['./main.js'], function (exports) {
	'use strict';
	return {
		setters: [function (module) {
			exports('shared', module.shared);
		}],
		execute: function () {



		}
	};
});
