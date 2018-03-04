System.register([], function (exports, module) {
	'use strict';
	return {
		execute: function () {

			var aExp = exports('aExp', {});
			var logicalAExp = aExp || {};
			logicalAExp.bar = 1;

			var bExp = exports('bExp', {});
			var logicalBExp = false || bExp;
			logicalBExp.bar = 1;

			var cExp = exports('cExp', {});
			var logicalCExp = true && cExp;
			logicalCExp.bar = 1;

		}
	};
});
