System.register(['./generated-chunk.js'], function () {
	'use strict';
	var dep;
	return {
		setters: [function (module) {
			dep = module.d;
		}],
		execute: function () {

			console.log('1', dep);

		}
	};
});
