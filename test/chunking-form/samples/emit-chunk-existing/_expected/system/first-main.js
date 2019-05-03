System.register(['./generated-dep.js'], function (exports, module) {
	'use strict';
	var value;
	return {
		setters: [function (module) {
			value = module.default;
		}],
		execute: function () {

			console.log('main1', value);

		}
	};
});
