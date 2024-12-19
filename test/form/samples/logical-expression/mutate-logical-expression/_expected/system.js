System.register('bundle', [], (function (exports) {
	'use strict';
	return {
		execute: (function () {

			var aExp = exports("aExp", {});
			var logicalAExp = aExp;
			logicalAExp.bar = 1;

			var bExp = exports("bExp", {});
			var logicalBExp = bExp;
			logicalBExp.bar = 1;

			var cExp = exports("cExp", {});
			var logicalCExp = cExp;
			logicalCExp.bar = 1;

		})
	};
}));
