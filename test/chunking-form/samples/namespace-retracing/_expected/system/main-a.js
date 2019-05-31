System.register(['./generated-chunk.js'], function (exports, module) {
	'use strict';
	var Other, Broken;
	return {
		setters: [function (module) {
			Other = module.O;
			Broken = module.B;
		}],
		execute: function () {

			Other.doSomething();
			Broken.doSomething();

		}
	};
});
