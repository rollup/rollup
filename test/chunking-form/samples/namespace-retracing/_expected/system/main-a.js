System.register(['./chunk-9009295b.js'], function (exports, module) {
	'use strict';
	var Other, Broken;
	return {
		setters: [function (module) {
			Other = module.a;
			Broken = module.b;
		}],
		execute: function () {

			Other.doSomething();
			Broken.doSomething();

		}
	};
});
