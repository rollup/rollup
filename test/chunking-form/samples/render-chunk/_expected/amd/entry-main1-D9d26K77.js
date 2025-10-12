define(['module', 'require', './chunk-dep2-Dn_1MukY'], (function (module, require, dep2) { 'use strict';

	var num = 1;
	console.log('referenced asset', new URL(require.toUrl('./asset-test-C4X7hChn'), new URL(module.uri, document.baseURI).href).href);

	console.log(num + dep2.num);
	console.log('referenced asset', new URL(require.toUrl('./asset-test-C4X7hChn'), new URL(module.uri, document.baseURI).href).href);

}));
console.log({
  "exports": [],
  "facadeModuleId": "**/main1.js",
  "isDynamicEntry": false,
  "isEntry": true,
  "isImplicitEntry": false,
  "moduleIds": [
    "**/dep1.js",
    "**/main1.js"
  ],
  "name": "main1",
  "type": "chunk",
  "dynamicImports": [],
  "fileName": "entry-main1-D9d26K77.js",
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
    "**/dep1.js": {
      "code": "\tvar num = 1;\n\tconsole.log('referenced asset', new URL(require.toUrl('./asset-test-C4X7hChn'), new URL(module.uri, document.baseURI).href).href);",
      "originalLength": 19,
      "removedExports": [],
      "renderedExports": [
        "num"
      ],
      "renderedLength": 143
    },
    "**/main1.js": {
      "code": "\tconsole.log(num + dep2.num);\n\tconsole.log('referenced asset', new URL(require.toUrl('./asset-test-C4X7hChn'), new URL(module.uri, document.baseURI).href).href);",
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
