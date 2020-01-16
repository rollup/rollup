System.register(['./generated-dep2.js'], function (exports, module) {
	'use strict';
	var value2;
	return {
		setters: [function (module) {
			value2 = module.v;
			exports('value2', module.v);
		}],
		execute: function () {

			// doesn't import value1, so we can't have also loaded value1?
			console.log('main2', value2);
			module.import('./generated-dynamic.js');

		}
	};
});
