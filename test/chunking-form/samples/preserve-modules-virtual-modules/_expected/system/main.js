System.register(['./_virtual/_virtualModule'], function (exports, module) {
	'use strict';
	var virtual;
	return {
		setters: [function (module) {
			virtual = module.virtual;
		}],
		execute: function () {

			assert.equal(virtual, 'Virtual!');

		}
	};
});
