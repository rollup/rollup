System.register(['./chunk-55e635b3.js'], function (exports, module) {
	'use strict';
	var dep, dynamic;
	return {
		setters: [function (module) {
			dep = module.a;
			dynamic = module.b;
		}],
		execute: function () {

			console.log('main2', dynamic, dep);

		}
	};
});
