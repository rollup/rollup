System.register('Sticky', ['react-sticky'], function (exports, module) {
	'use strict';
	var Sticky;
	return {
		setters: [function (module) {
			Sticky = module.Sticky;
		}],
		execute: function () {

			var Sticky$1 = exports('default', function () {
				function Sticky$$1() {}

				Sticky$$1.foo = Sticky;

				return Sticky$$1;
			}());

		}
	};
});
