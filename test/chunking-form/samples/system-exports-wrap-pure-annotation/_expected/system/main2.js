System.register(['./generated-chunk.js'], function (exports, module) {
	'use strict';
	var dep;
	return {
		setters: [function (module) {
			dep = module.d;
		}],
		execute: function () {

			console.log('2', dep);

		}
	};
});
