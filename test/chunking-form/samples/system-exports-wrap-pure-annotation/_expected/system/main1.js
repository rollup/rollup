System.register(['./generated-chunk.js'], function (exports, module) {
	'use strict';
	var dep;
	return {
		setters: [function (module) {
			dep = module.a;
		}],
		execute: function () {

			console.log('1', dep);

		}
	};
});
