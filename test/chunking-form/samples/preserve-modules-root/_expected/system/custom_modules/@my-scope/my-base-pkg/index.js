System.register(['../../../_virtual/index.js'], (function (exports) {
	'use strict';
	var myBasePkg;
	return {
		setters: [function (module) {
			myBasePkg = module.__exports;
		}],
		execute: (function () {

			exports("__require", requireMyBasePkg);

			var hasRequiredMyBasePkg;

			function requireMyBasePkg () {
				if (hasRequiredMyBasePkg) return myBasePkg;
				hasRequiredMyBasePkg = 1;

				Object.defineProperty(myBasePkg, '__esModule', { value: true });

				var hello = 'world';

				myBasePkg.hello = hello;
				return myBasePkg;
			}

		})
	};
}));
