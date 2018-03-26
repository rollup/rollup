System.register(['babel-polyfill', 'other'], function (exports, module) {
	'use strict';
	var x;
	return {
		setters: [function () {}, function (module) {
			x = module.x;
		}],
		execute: function () {

			x();

			var main = exports('default', new WeakMap());

		}
	};
});
