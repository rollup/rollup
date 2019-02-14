System.register('myBundle', [], function (exports, module) {
	'use strict';
	return {
		execute: function () {

			const localIsNan = isNan;

			const isNaN = exports('isNaN', localIsNan);

		}
	};
});
