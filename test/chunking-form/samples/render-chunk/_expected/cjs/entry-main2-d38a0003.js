'use strict';

var dep2 = require('./chunk-dep2-73d298cd.js');

var num = 3;
console.log('referenced asset', (typeof document === 'undefined' ? new (require('u' + 'rl').URL)('file:' + __dirname + '/asset-test-31f014b5').href : new URL('asset-test-31f014b5', document.currentScript && document.currentScript.src || document.baseURI).href));

console.log(dep2.num + num);
console.log('referenced asset', (typeof document === 'undefined' ? new (require('u' + 'rl').URL)('file:' + __dirname + '/asset-test-31f014b5').href : new URL('asset-test-31f014b5', document.currentScript && document.currentScript.src || document.baseURI).href));
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
  "fileName": "entry-main2-d38a0003.js",
  "implicitlyLoadedBefore": [],
  "importedBindings": {
    "chunk-dep2-73d298cd.js": [
      "num"
    ]
  },
  "imports": [
    "chunk-dep2-73d298cd.js"
  ],
  "modules": {
    "**/dep3.js": {
      "code": "var num = 3;\nconsole.log('referenced asset', (typeof document === 'undefined' ? new (require('u' + 'rl').URL)('file:' + __dirname + '/asset-test-31f014b5').href : new URL('asset-test-31f014b5', document.currentScript && document.currentScript.src || document.baseURI).href));",
      "originalLength": 19,
      "removedExports": [],
      "renderedExports": [
        "num"
      ],
      "renderedLength": 275
    },
    "**/main2.js": {
      "code": "console.log(dep2.num + num);\nconsole.log('referenced asset', (typeof document === 'undefined' ? new (require('u' + 'rl').URL)('file:' + __dirname + '/asset-test-31f014b5').href : new URL('asset-test-31f014b5', document.currentScript && document.currentScript.src || document.baseURI).href));",
      "originalLength": 102,
      "removedExports": [],
      "renderedExports": [],
      "renderedLength": 291
    }
  },
  "referencedFiles": [
    "asset-test-31f014b5"
  ]
});
console.log('all chunks', ["entry-main1-693414b0.js","chunk-dep2-73d298cd.js","entry-main2-d38a0003.js"])
console.log('referenced asset in renderChunk', 'asset-test-31f014b5');
