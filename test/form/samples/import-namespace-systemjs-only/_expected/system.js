System.register(['dependency'], function () {
	'use strict';
	var dependency$1;
	return {
		setters: [function (module) {
			dependency$1 = module;
		}],
		execute: function () {

			console.log(dependency$1);

		}
	};
});