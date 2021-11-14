System.register(['./_virtual/other.js_commonjs-exports.js'], (function (exports) {
	'use strict';
	var other;
	return {
		setters: [function (module) {
			other = module.__exports;
			exports('default', module.__exports);
		}],
		execute: (function () {

			other.value = 43;

		})
	};
}));
