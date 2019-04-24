System.register(['./generated-build-starter.js'], function (exports, module) {
	'use strict';
	var value, otherValue;
	return {
		setters: [function (module) {
			value = module.a;
			otherValue = module.b;
		}],
		execute: function () {

			console.log('main', value, otherValue);

		}
	};
});
