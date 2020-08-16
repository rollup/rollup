System.register(['dependency'], function () {
	'use strict';
	var dependency;
	return {
		setters: [function (module) {
			dependency = module;
		}],
		execute: function () {

			console.log(dependency);

		}
	};
});
