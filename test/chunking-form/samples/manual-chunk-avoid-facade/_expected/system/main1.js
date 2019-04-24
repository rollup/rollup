System.register(['./manual.js'], function (exports, module) {
	'use strict';
	var value;
	return {
		setters: [function (module) {
			value = module.reexported;
		}],
		execute: function () {

			console.log('main', value);

		}
	};
});
