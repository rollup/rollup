esDynamicImportPreload('./generated-chain-3.js', {"generated-chain-2.js":"'./generated-chain-2.js'","generated-leaf.js":"'./generated-leaf.js'"}, "main.js", "generated-chain-3.js");
esDynamicImportPreload('./generated-chain-2.js', {"generated-leaf.js":"'./generated-leaf.js'"}, "main.js", "generated-chain-2.js");
esDynamicImportPreload(somethingElse, null, "main.js", null);
esDynamicImportPreload('external-module', null, "main.js", null);
esDynamicImportPreload('./generated-imports-external.js', {"external-module":"'external-module'"}, "main.js", "generated-imports-external.js");
