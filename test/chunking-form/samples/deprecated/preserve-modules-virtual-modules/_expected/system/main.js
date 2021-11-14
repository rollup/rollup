System.register(['./_virtual/_virtualModule.js'], (function () {
	'use strict';
	var virtual;
	return {
		setters: [function (module) {
			virtual = module.virtual;
		}],
		execute: (function () {

			assert.equal(virtual, 'Virtual!');

		})
	};
}));
