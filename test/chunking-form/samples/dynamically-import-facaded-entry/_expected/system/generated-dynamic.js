System.register(['./generated-main.js'], function () {
	'use strict';
	var value;
	return {
		setters: [function (module) {
			value = module.v;
		}],
		execute: function () {

			console.log('dynamic', value);

		}
	};
});
