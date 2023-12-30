System.register('bundle', ['./main2.js'], (function (exports) {
	'use strict';
	return {
		setters: [function (module) {
			exports("foo", module["default"]);
		}],
		execute: (function () {



		})
	};
}));
