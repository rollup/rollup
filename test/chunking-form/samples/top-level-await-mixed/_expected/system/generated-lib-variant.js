System.register(['./generated-lib.js'], (function (exports) {
	'use strict';
	var getInfo;
	return {
		setters: [function (module) {
			getInfo = module.g;
		}],
		execute: (function () {

			exports("getInfoWithVariant", getInfoWithVariant);

			function getInfoWithVariant() {
				return getInfo() + '_variant';
			}

		})
	};
}));
