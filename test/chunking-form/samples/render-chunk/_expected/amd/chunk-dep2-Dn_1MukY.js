define(['module', 'require', 'exports'], (function (module, require, exports) { 'use strict';

	var num = 2;
	console.log('referenced asset', new URL(require.toUrl('./asset-test-C4X7hChn'), new URL(module.uri, document.baseURI).href).href);

	exports.num = num;

}));
console.log({
  "exports": [
    "num"
  ],
  "facadeModuleId": null,
  "isDynamicEntry": false,
  "isEntry": false,
  "isImplicitEntry": false,
  "moduleIds": [
    "**/dep2.js"
  ],
  "name": "dep2",
  "type": "chunk",
  "dynamicImports": [],
  "fileName": "chunk-dep2-Dn_1MukY.js",
  "implicitlyLoadedBefore": [],
  "importedBindings": {},
  "imports": [],
  "modules": {
    "**/dep2.js": {
      "code": "\tvar num = 2;\n\tconsole.log('referenced asset', new URL(require.toUrl('./asset-test-C4X7hChn'), new URL(module.uri, document.baseURI).href).href);",
      "originalLength": 19,
      "removedExports": [],
      "renderedExports": [
        "num"
      ],
      "renderedLength": 143
    }
  },
  "referencedFiles": [
    "asset-test-C4X7hChn"
  ]
});
console.log('all chunks', ["entry-main1-D9d26K77.js","entry-main2-BtW3xAye.js","chunk-dep2-Dn_1MukY.js"])
console.log('referenced asset in renderChunk', 'asset-test-C4X7hChn');
