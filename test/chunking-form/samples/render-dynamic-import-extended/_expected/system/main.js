System.register([], (function (exports, module) {
	'use strict';
	return {
		execute: (function () {

			systemDynamicImportPreload('./generated-chain-3.js', {"generated-chain-2.js":"'./generated-chain-2.js'","generated-leaf.js":"'./generated-leaf.js'"}, "main.js", "generated-chain-3.js");
			systemDynamicImportPreload('./generated-chain-2.js', {"generated-leaf.js":"'./generated-leaf.js'"}, "main.js", "generated-chain-2.js");
			systemDynamicImportPreload(somethingElse, null, "main.js", null);
			systemDynamicImportPreload('external-module', null, "main.js", null);
			systemDynamicImportPreload('./generated-imports-external.js', {"external-module":"'external-module'"}, "main.js", "generated-imports-external.js");

		})
	};
}));
