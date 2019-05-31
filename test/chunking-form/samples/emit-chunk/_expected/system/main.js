System.register(['./generated-chunk.js'], function (exports, module) {
	'use strict';
	var value;
	return {
		setters: [function (module) {
			value = module.v;
		}],
		execute: function () {

			console.log('main', value);

		}
	};
});
