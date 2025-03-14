'use strict';

cjsDynamicImportPreload('./generated-chain-3.js', {"generated-chain-2.js":"'./generated-chain-2.js'","generated-leaf.js":"'./generated-leaf.js'"}, "main.js", "generated-chain-3.js");
cjsDynamicImportPreload('./generated-chain-2.js', {"generated-leaf.js":"'./generated-leaf.js'"}, "main.js", "generated-chain-2.js");
cjsDynamicImportPreload(somethingElse, null, "main.js", null);
cjsDynamicImportPreload('external-module', null, "main.js", null);
cjsDynamicImportPreload('./generated-imports-external.js', {"external-module":"'external-module'"}, "main.js", "generated-imports-external.js");
