define(['require', './chunk-dep2-5e5c0a2b'], (function (require, dep2) { 'use strict';

	var num = 1;
	console.log('referenced asset', new URL(require.toUrl('./asset-test-9f86d081'), document.baseURI).href);

	console.log(num + dep2.num);
	console.log('referenced asset', new URL(require.toUrl('./asset-test-9f86d081'), document.baseURI).href);

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
  "fileName": "entry-main1-92387c07.js",
  "implicitlyLoadedBefore": [],
  "importedBindings": {
    "chunk-dep2-5e5c0a2b.js": [
      "num"
    ]
  },
  "imports": [
    "chunk-dep2-5e5c0a2b.js"
  ],
  "modules": {
    "**/dep1.js": {
      "code": "\tvar num = 1;\n\tconsole.log('referenced asset', new URL(require.toUrl('./asset-test-9f86d081'), document.baseURI).href);",
      "originalLength": 19,
      "removedExports": [],
      "renderedExports": [
        "num"
      ],
      "renderedLength": 117
    },
    "**/main1.js": {
      "code": "\tconsole.log(num + dep2.num);\n\tconsole.log('referenced asset', new URL(require.toUrl('./asset-test-9f86d081'), document.baseURI).href);",
      "originalLength": 102,
      "removedExports": [],
      "renderedExports": [],
      "renderedLength": 133
    }
  },
  "referencedFiles": [
    "asset-test-9f86d081"
  ]
});
console.log('all chunks', ["entry-main1-92387c07.js","chunk-dep2-5e5c0a2b.js","entry-main2-8423cd41.js"])
console.log('referenced asset in renderChunk', 'asset-test-9f86d081');
