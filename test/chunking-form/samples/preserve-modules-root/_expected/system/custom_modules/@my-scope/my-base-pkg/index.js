System.register(['../../../_virtual/index.js'], (function (exports) {
	'use strict';
	var myBasePkg;
	return {
		setters: [function (module) {
			myBasePkg = module.__exports;
			exports("default", module.__exports);
		}],
		execute: (function () {

			Object.defineProperty(myBasePkg, '__esModule', { value: true });

			var hello = 'world';

			myBasePkg.hello = hello;

		})
	};
}));
