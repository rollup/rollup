System.register(['./generated-chunk.js'], function () {
	'use strict';
	var Other;
	return {
		setters: [function (module) {
			Other = module.O;
		}],
		execute: function () {

			Other.doSomething();

		}
	};
});
