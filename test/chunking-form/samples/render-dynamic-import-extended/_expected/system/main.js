System.register([], (function (exports, module) {
	'use strict';
	return {
		execute: (function () {

			systemDynamicImportPreload('./generated-chain-3.js', {"generated-chain-2.js":"'./generated-chain-2.js'","generated-leaf.js":"'./generated-leaf.js'"});
			systemDynamicImportPreload('./generated-chain-2.js', {"generated-leaf.js":"'./generated-leaf.js'"});
			systemDynamicImportPreload(somethingElse, null);
			systemDynamicImportPreload('external-module', null);
			systemDynamicImportPreload('./generated-imports-external.js', {"external-module":"'external-module'"});

		})
	};
}));
