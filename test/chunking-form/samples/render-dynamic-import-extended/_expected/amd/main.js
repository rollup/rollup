define(['require'], (function (require) { 'use strict';

	amdDynamicImportPreload('./generated-chain-3', {"generated-chain-2.js":"'./generated-chain-2'","generated-leaf.js":"'./generated-leaf'"}, "main.js", "generated-chain-3.js");
	amdDynamicImportPreload('./generated-chain-2', {"generated-leaf.js":"'./generated-leaf'"}, "main.js", "generated-chain-2.js");
	amdDynamicImportPreload(somethingElse, null, "main.js", null);
	amdDynamicImportPreload('external-module', null, "main.js", null);
	amdDynamicImportPreload('./generated-imports-external', {"external-module":"'external-module'"}, "main.js", "generated-imports-external.js");

}));
