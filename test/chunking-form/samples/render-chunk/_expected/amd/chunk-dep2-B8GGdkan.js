define(['require', 'exports'], (function (require, exports) { 'use strict';

	var num = 2;
	console.log('referenced asset', new URL(require.toUrl('./asset-test-C4X7hChn'), document.baseURI).href);

	exports.num = num;

}));
console.log({
  "exports": [
    "num"
  ],
  "facadeModuleAttributes": {},
  "facadeModuleId": null,
  "facadeModuleRawId": null,
  "isDynamicEntry": false,
  "isEntry": false,
  "isImplicitEntry": false,
  "moduleIds": [
    "**/dep2.js"
  ],
  "name": "dep2",
  "type": "chunk",
  "dynamicImports": [],
  "fileName": "chunk-dep2-B8GGdkan.js",
  "implicitlyLoadedBefore": [],
  "importedBindings": {},
  "imports": [],
  "modules": {
    "**/dep2.js": {
      "attributes": {},
      "code": "\tvar num = 2;\n\tconsole.log('referenced asset', new URL(require.toUrl('./asset-test-C4X7hChn'), document.baseURI).href);",
      "originalLength": 19,
      "rawId": "**/dep2.js",
      "removedExports": [],
      "renderedExports": [
        "num"
      ],
      "renderedLength": 117
    }
  },
  "referencedFiles": [
    "asset-test-C4X7hChn"
  ]
});
console.log('all chunks', ["entry-main1-Bm972dwn.js","entry-main2-eGY-AdlU.js","chunk-dep2-B8GGdkan.js"])
console.log('referenced asset in renderChunk', 'asset-test-C4X7hChn');
