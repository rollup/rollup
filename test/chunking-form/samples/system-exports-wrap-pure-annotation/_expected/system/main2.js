System.register(['./generated-dep.js'], function () {
	'use strict';
	var dep$1;
	return {
		setters: [function (module) {
			dep$1 = module.d;
		}],
		execute: function () {

			console.log('2', dep$1);

		}
	};
});
