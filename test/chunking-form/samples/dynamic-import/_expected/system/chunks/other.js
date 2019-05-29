System.register(['./chunk.js'], function (exports) {
	'use strict';
	return {
		setters: [function (module) {
			exports('value', module.s);
		}],
		execute: function () {



		}
	};
});
