System.register(['./generated-dep.js'], function () {
	'use strict';
	var value1;
	return {
		setters: [function (module) {
			value1 = module.v;
		}],
		execute: function () {

			console.log('dynamic', value1);

		}
	};
});
