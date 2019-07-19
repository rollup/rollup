System.register(['./generated-chunk.js', './custom/build-start-chunk.js'], function () {
	'use strict';
	var value, value2;
	return {
		setters: [function (module) {
			value = module.v;
		}, function (module) {
			value2 = module.default;
		}],
		execute: function () {

			console.log('main', value, value2);

		}
	};
});
