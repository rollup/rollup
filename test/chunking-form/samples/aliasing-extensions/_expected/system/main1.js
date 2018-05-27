System.register([], function (exports, module) {
	'use strict';
	return {
		execute: function () {

			console.log('main1');
			module.import("./main4.dynamic.js");
			module.import("./main5.js");

		}
	};
});
