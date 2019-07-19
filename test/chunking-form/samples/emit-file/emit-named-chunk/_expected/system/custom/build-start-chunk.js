System.register(['../generated-chunk.js'], function (exports) {
	'use strict';
	var value;
	return {
		setters: [function (module) {
			value = module.v;
		}],
		execute: function () {

			console.log('startBuild', value);

			var value2 = exports('default', 43);

		}
	};
});
