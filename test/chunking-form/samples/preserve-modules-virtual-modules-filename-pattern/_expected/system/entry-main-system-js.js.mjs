System.register(['./entry-_virtual/_virtualModule-system-.mjs', './entry-_virtual/_virtualWithExt-system-js.js.mjs', './entry-_virtual/_virtualWithAssetExt-system-str.str.str.mjs'], (function () {
	'use strict';
	var virtual, virtual2, virtual3;
	return {
		setters: [function (module) {
			virtual = module.virtual;
		}, function (module) {
			virtual2 = module.virtual2;
		}, function (module) {
			virtual3 = module.virtual3;
		}],
		execute: (function () {

			assert.equal(virtual, 'Virtual!');
			assert.equal(virtual2, 'Virtual2!');
			assert.equal(virtual3, 'Virtual3!');

		})
	};
}));
