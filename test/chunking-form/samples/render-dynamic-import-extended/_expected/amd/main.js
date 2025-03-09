define(['require'], (function (require) { 'use strict';

	amdDynamicImportPreload('./generated-chain-3', {"generated-chain-2.js":"'./generated-chain-2'","generated-leaf.js":"'./generated-leaf'"});
	amdDynamicImportPreload('./generated-chain-2', {"generated-leaf.js":"'./generated-leaf'"});
	amdDynamicImportPreload(somethingElse, null);
	amdDynamicImportPreload('external-module', null);
	amdDynamicImportPreload('./generated-imports-external', {"external-module":"'external-module'"});

}));
