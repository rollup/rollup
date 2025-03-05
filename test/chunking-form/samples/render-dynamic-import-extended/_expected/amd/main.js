define(['require'], (function (require) { 'use strict';

	amdDynamicImportPreload('./generated-chain-3', ["generated-chain-2.js","generated-leaf.js"]);
	amdDynamicImportPreload('./generated-chain-2', ["generated-leaf.js"]);
	amdDynamicImportPreload(somethingElse, null);

}));
