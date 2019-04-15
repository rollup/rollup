System.register([], function (exports, module) {
	'use strict';
	return {
		execute: function () {

			console.log('inner');

			console.log('middle');

			console.log('outer');

		}
	};
});
