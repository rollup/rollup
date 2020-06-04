System.register([], function (exports) {
	'use strict';
	return {
		execute: function () {

			const foo = function (v) {exports({bar: foo, foo: foo}); return v;} ( 1);

		}
	};
});
