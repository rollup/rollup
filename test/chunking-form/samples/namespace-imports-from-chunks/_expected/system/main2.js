System.register(['./main1.js'], function (exports, module) {
	'use strict';
	var p;
	return {
		setters: [function (module) {
			p = module.p;
		}],
		execute: function () {

console.log( p );

		}
	};
});
