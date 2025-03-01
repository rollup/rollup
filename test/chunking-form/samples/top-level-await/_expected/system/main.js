System.register(['./generated-lib.js'], (function (exports, module) {
	'use strict';
	var getInfo;
	return {
		setters: [function (module) {
			getInfo = module.g;
		}],
		execute: (async function () {

			let getCommonInfo = exports("getCommonInfo", getInfo);

			const { getInfoWithVariant } = await module.import('./generated-lib-variant.js');
			exports("getCommonInfo", getCommonInfo = getInfoWithVariant);

		})
	};
}));
