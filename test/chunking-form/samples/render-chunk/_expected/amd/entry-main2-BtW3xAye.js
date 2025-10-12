define(['module', 'require', './chunk-dep2-Dn_1MukY'], (function (module, require, dep2) { 'use strict';

	var num = 3;
	console.log('referenced asset', new URL(require.toUrl('./asset-test-C4X7hChn'), new URL(module.uri, document.baseURI).href).href);

	console.log(dep2.num + num);
	console.log('referenced asset', new URL(require.toUrl('./asset-test-C4X7hChn'), new URL(module.uri, document.baseURI).href).href);

}));
console.log({
  "exports": [],
  "facadeModuleId": "**/main2.js",
  "isDynamicEntry": false,
  "isEntry": true,
  "isImplicitEntry": false,
  "moduleIds": [
    "**/dep3.js",
    "**/main2.js"
  ],
  "name": "main2",
  "type": "chunk",
  "dynamicImports": [],
  "fileName": "entry-main2-BtW3xAye.js",
  "implicitlyLoadedBefore": [],
  "importedBindings": {
    "chunk-dep2-Dn_1MukY.js": [
      "num"
    ]
  },
  "imports": [
    "chunk-dep2-Dn_1MukY.js"
  ],
  "modules": {
    "**/dep3.js": {
      "code": "\tvar num = 3;\n\tconsole.log('referenced asset', new URL(require.toUrl('./asset-test-C4X7hChn'), new URL(module.uri, document.baseURI).href).href);",
      "originalLength": 19,
      "removedExports": [],
      "renderedExports": [
        "num"
      ],
      "renderedLength": 143
    },
    "**/main2.js": {
      "code": "\tconsole.log(dep2.num + num);\n\tconsole.log('referenced asset', new URL(require.toUrl('./asset-test-C4X7hChn'), new URL(module.uri, document.baseURI).href).href);",
      "originalLength": 102,
      "removedExports": [],
      "renderedExports": [],
      "renderedLength": 159
    }
  },
  "referencedFiles": [
    "asset-test-C4X7hChn"
  ]
});
console.log('all chunks', ["entry-main1-D9d26K77.js","entry-main2-BtW3xAye.js","chunk-dep2-Dn_1MukY.js"])
console.log('referenced asset in renderChunk', 'asset-test-C4X7hChn');
