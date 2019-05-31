System.register(['./generated-chunk.js'], function (exports) {
	'use strict';
	var commonjsGlobal, d;
	return {
		setters: [function (module) {
			commonjsGlobal = module.c;
			d = module.d;
		}],
		execute: function () {

			commonjsGlobal.fn = d => d + 1;
			var cjs = commonjsGlobal.fn;

			var main1 = exports('default', d.map(cjs));

		}
	};
});
