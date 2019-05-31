System.register(['./generated-chunk.js'], function (exports, module) {
	'use strict';
	var dynamic, dep;
	return {
		setters: [function (module) {
			dynamic = module.d;
			dep = module.a;
		}],
		execute: function () {

			console.log('main2', dynamic, dep);

		}
	};
});
