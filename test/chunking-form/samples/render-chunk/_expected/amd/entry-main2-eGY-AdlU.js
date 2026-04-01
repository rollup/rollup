define(['require', './chunk-dep2-B8GGdkan'], (function (require, dep2) { 'use strict';

	var num = 3;
	console.log('referenced asset', new URL(require.toUrl('./asset-test-C4X7hChn'), document.baseURI).href);

	console.log(dep2.num + num);
	console.log('referenced asset', new URL(require.toUrl('./asset-test-C4X7hChn'), document.baseURI).href);

}));
console.log({
  "exports": [],
  "facadeModuleAttributes": {},
  "facadeModuleId": "**/main2.js",
  "facadeModuleRawId": "**/main2.js",
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
  "fileName": "entry-main2-eGY-AdlU.js",
  "implicitlyLoadedBefore": [],
  "importedBindings": {
    "chunk-dep2-B8GGdkan.js": [
      "num"
    ]
  },
  "imports": [
    "chunk-dep2-B8GGdkan.js"
  ],
  "modules": {
    "**/dep3.js": {
      "attributes": {},
      "code": "\tvar num = 3;\n\tconsole.log('referenced asset', new URL(require.toUrl('./asset-test-C4X7hChn'), document.baseURI).href);",
      "originalLength": 19,
      "rawId": "**/dep3.js",
      "removedExports": [],
      "renderedExports": [
        "num"
      ],
      "renderedLength": 117
    },
    "**/main2.js": {
      "attributes": {},
      "code": "\tconsole.log(dep2.num + num);\n\tconsole.log('referenced asset', new URL(require.toUrl('./asset-test-C4X7hChn'), document.baseURI).href);",
      "originalLength": 102,
      "rawId": "**/main2.js",
      "removedExports": [],
      "renderedExports": [],
      "renderedLength": 133
    }
  },
  "referencedFiles": [
    "asset-test-C4X7hChn"
  ]
});
console.log('all chunks', ["entry-main1-Bm972dwn.js","entry-main2-eGY-AdlU.js","chunk-dep2-B8GGdkan.js"])
console.log('referenced asset in renderChunk', 'asset-test-C4X7hChn');
