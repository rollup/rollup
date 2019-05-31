System.register(['./manual.js'], function () {
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
