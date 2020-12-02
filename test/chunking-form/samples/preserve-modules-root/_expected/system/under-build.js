System.register(['./custom_modules/@my-scope/my-base-pkg/index.js'], function (exports) {
	'use strict';
	var myBasePkg;
	return {
		setters: [function (module) {
			myBasePkg = module.default;
		}],
		execute: function () {

			var underBuild = exports('default', {
				base: myBasePkg
			});

		}
	};
});
