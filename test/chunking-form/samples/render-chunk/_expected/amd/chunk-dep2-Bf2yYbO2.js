define(['require', 'exports'], (function (require, exports) { 'use strict';

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
  "fileName": "chunk-dep2-Bf2yYbO2.js",
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
console.log('all chunks', ["entry-main1-CaHH0ffp.js","entry-main2-C4xeIXIZ.js","chunk-dep2-Bf2yYbO2.js"])
console.log('referenced asset in renderChunk', 'asset-test-C4X7hChn');
