define(['require', './chunk-dep2-80e44242e'], (function (require, dep2) { 'use strict';

	var num = 1;
	console.log('referenced asset', new URL(require.toUrl('./asset-test-9f86d0818'), document.baseURI).href);

	console.log(num + dep2.num);
	console.log('referenced asset', new URL(require.toUrl('./asset-test-9f86d0818'), document.baseURI).href);

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
  "fileName": "entry-main1-8ead5feeb.js",
  "implicitlyLoadedBefore": [],
  "importedBindings": {
    "chunk-dep2-80e44242e.js": [
      "num"
    ]
  },
  "imports": [
    "chunk-dep2-80e44242e.js"
  ],
  "modules": {
    "**/dep1.js": {
      "code": "\tvar num = 1;\n\tconsole.log('referenced asset', new URL(require.toUrl('./asset-test-9f86d0818'), document.baseURI).href);",
      "originalLength": 19,
      "removedExports": [],
      "renderedExports": [
        "num"
      ],
      "renderedLength": 118
    },
    "**/main1.js": {
      "code": "\tconsole.log(num + dep2.num);\n\tconsole.log('referenced asset', new URL(require.toUrl('./asset-test-9f86d0818'), document.baseURI).href);",
      "originalLength": 102,
      "removedExports": [],
      "renderedExports": [],
      "renderedLength": 134
    }
  },
  "referencedFiles": [
    "asset-test-9f86d0818"
  ]
});
console.log('all chunks', ["entry-main1-8ead5feeb.js","chunk-dep2-80e44242e.js","entry-main2-c8ddb3661.js"])
console.log('referenced asset in renderChunk', 'asset-test-9f86d0818');
