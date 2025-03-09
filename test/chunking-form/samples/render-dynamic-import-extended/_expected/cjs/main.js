'use strict';

cjsDynamicImportPreload('./generated-chain-3.js', {"generated-chain-2.js":"'./generated-chain-2.js'","generated-leaf.js":"'./generated-leaf.js'"});
cjsDynamicImportPreload('./generated-chain-2.js', {"generated-leaf.js":"'./generated-leaf.js'"});
cjsDynamicImportPreload(somethingElse, null);
cjsDynamicImportPreload('external-module', null);
cjsDynamicImportPreload('./generated-imports-external.js', {"external-module":"'external-module'"});
