System.register([], function (exports) {
	'use strict';
	return {
		execute: function () {

			var x = 43;
			exports('x', x);console.log('dep2');

		}
	};
});
