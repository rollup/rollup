System.register(['./chunk-ebd5007a.js'], function (exports, module) {
	'use strict';
	var commonjsGlobal, d;
	return {
		setters: [function (module) {
			commonjsGlobal = module.a;
			d = module.b;
		}],
		execute: function () {

			commonjsGlobal.fn = d$$1 => d$$1 + 1;
			var cjs = commonjsGlobal.fn;

			var main1 = exports('default', d.map(cjs));

		}
	};
});
