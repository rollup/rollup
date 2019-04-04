System.register(['../other.js'], function (exports, module) {
	'use strict';
	var other;
	return {
		setters: [function (module) {
			other = module.__moduleExports;
		}],
		execute: function () {

			exports('default', other);

		}
	};
});
