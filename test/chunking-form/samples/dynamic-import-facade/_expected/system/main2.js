System.register(['./generated-chunk.js'], function (exports, module) {
	'use strict';
	var dynamic, dep;
	return {
		setters: [function (module) {
			dynamic = module.a;
			dep = module.b;
		}],
		execute: function () {

			console.log('main2', dynamic, dep);

		}
	};
});
