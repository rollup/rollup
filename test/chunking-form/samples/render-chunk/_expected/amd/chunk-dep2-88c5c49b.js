define(['require', 'exports'], (function (require, exports) { 'use strict';

	var num = 2;
	console.log('referenced asset', new URL(require.toUrl('./asset-test-9f86d081'), document.baseURI).href);

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
  "fileName": "chunk-dep2-88c5c49b.js",
  "implicitlyLoadedBefore": [],
  "importedBindings": {},
  "imports": [],
  "modules": {
    "**/dep2.js": {
      "code": "\tvar num = 2;\n\tconsole.log('referenced asset', new URL(require.toUrl('./asset-test-9f86d081'), document.baseURI).href);",
      "originalLength": 19,
      "removedExports": [],
      "renderedExports": [
        "num"
      ],
      "renderedLength": 117
    }
  },
  "referencedFiles": [
    "asset-test-9f86d081"
  ]
});
console.log('all chunks', ["entry-main1-87907a68.js","chunk-dep2-88c5c49b.js","entry-main2-71e00327.js"])
console.log('referenced asset in renderChunk', 'asset-test-9f86d081');
