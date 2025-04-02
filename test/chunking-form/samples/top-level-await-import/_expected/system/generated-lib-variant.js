System.register([], (function (exports, module) {
	'use strict';
	return {
		execute: (async function () {

			exports("getInfoWithVariant", getInfoWithVariant);

			const { getInfoWithUsed } = await module.import('./generated-lib-used.js');

			function getInfoWithVariant() {
				return getInfoWithUsed() + '_variant';
			}

		})
	};
}));
