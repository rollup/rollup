System.register([], (function (exports) {
	'use strict';
	return {
		execute: (function () {

			exports("__require", requireMain);

			var main;
			var hasRequiredMain;

			function requireMain () {
				if (hasRequiredMain) return main;
				hasRequiredMain = 1;
				main = true;
				return main;
			}

		})
	};
}));
