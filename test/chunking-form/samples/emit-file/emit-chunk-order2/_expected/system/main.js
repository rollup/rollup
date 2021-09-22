System.register(['./generated-emitted.js'], (function () {
	'use strict';
	var id, value;
	return {
		setters: [function (module) {
			id = module.i;
			value = module.v;
		}],
		execute: (function () {

			console.log(id);

			console.log('main', value);

		})
	};
}));
