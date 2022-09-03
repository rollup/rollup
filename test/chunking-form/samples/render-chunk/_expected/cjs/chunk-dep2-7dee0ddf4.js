'use strict';

var num = 2;
console.log('referenced asset', (typeof document === 'undefined' ? new (require('u' + 'rl').URL)('file:' + __dirname + '/asset-test-9f86d0818').href : new URL('asset-test-9f86d0818', document.currentScript && document.currentScript.src || document.baseURI).href));

exports.num = num;
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
  "fileName": "chunk-dep2-7dee0ddf4.js",
  "implicitlyLoadedBefore": [],
  "importedBindings": {},
  "imports": [],
  "modules": {
    "**/dep2.js": {
      "code": "var num = 2;\nconsole.log('referenced asset', (typeof document === 'undefined' ? new (require('u' + 'rl').URL)('file:' + __dirname + '/asset-test-9f86d0818').href : new URL('asset-test-9f86d0818', document.currentScript && document.currentScript.src || document.baseURI).href));",
      "originalLength": 19,
      "removedExports": [],
      "renderedExports": [
        "num"
      ],
      "renderedLength": 277
    }
  },
  "referencedFiles": [
    "asset-test-9f86d0818"
  ]
});
console.log('all chunks', ["entry-main1-9d05d34a2.js","chunk-dep2-7dee0ddf4.js","entry-main2-9ac8fff25.js"])
console.log('referenced asset in renderChunk', 'asset-test-9f86d0818');
