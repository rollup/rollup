System.register('Sticky', ['react-sticky'], (function (exports) {
	'use strict';
	var Sticky$1;
	return {
		setters: [function (module) {
			Sticky$1 = module.Sticky;
		}],
		execute: (function () {

			var Sticky = exports("default", function () {
				function Sticky() {}

				Sticky.foo = Sticky$1;

				return Sticky;
			}());

		})
	};
}));
