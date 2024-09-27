System.register(['./custom_modules/@my-scope/my-base-pkg/index.js'], (function (exports) {
	'use strict';
	var requireMyBasePkg;
	return {
		setters: [function (module) {
			requireMyBasePkg = module.__require;
		}],
		execute: (function () {

			exports("__require", requireUnderBuild);

			var underBuild;
			var hasRequiredUnderBuild;

			function requireUnderBuild () {
				if (hasRequiredUnderBuild) return underBuild;
				hasRequiredUnderBuild = 1;
				const base = requireMyBasePkg();

				underBuild = {
					base
				};
				return underBuild;
			}

		})
	};
}));
