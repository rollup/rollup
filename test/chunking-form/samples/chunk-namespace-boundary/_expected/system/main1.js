System.register(['./chunk-1db0f417.js'], function (exports, module) {
	'use strict';
	var commonjsGlobal, d;
	return {
		setters: [function (module) {
			commonjsGlobal = module.commonjsGlobal;
			d = module.d;
		}],
		execute: function () {

			commonjsGlobal.fn = d => d + 1;
			var cjs = commonjsGlobal.fn;

			var main1 = exports('default', d.map(cjs));

		}
	};
});
