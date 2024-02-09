'use strict';

var dep2 = require('./chunk-dep2-DaLIbws0.js');

var num = 3;
console.log('referenced asset', (typeof document === 'undefined' ? require('u' + 'rl').pathToFileURL(__dirname + '/asset-test-C4X7hChn').href : new URL('asset-test-C4X7hChn', document.currentScript && document.currentScript.src || document.baseURI).href));

console.log(dep2.num + num);
console.log('referenced asset', (typeof document === 'undefined' ? require('u' + 'rl').pathToFileURL(__dirname + '/asset-test-C4X7hChn').href : new URL('asset-test-C4X7hChn', document.currentScript && document.currentScript.src || document.baseURI).href));
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
  "fileName": "entry-main2-DPo9-iBy.js",
  "implicitlyLoadedBefore": [],
  "importedBindings": {
    "chunk-dep2-DaLIbws0.js": [
      "num"
    ]
  },
  "imports": [
    "chunk-dep2-DaLIbws0.js"
  ],
  "modules": {
    "**/dep3.js": {
      "code": "var num = 3;\nconsole.log('referenced asset', (typeof document === 'undefined' ? require('u' + 'rl').pathToFileURL(__dirname + '/asset-test-C4X7hChn').href : new URL('asset-test-C4X7hChn', document.currentScript && document.currentScript.src || document.baseURI).href));",
      "originalLength": 19,
      "removedExports": [],
      "renderedExports": [
        "num"
      ],
      "renderedLength": 269
    },
    "**/main2.js": {
      "code": "console.log(dep2.num + num);\nconsole.log('referenced asset', (typeof document === 'undefined' ? require('u' + 'rl').pathToFileURL(__dirname + '/asset-test-C4X7hChn').href : new URL('asset-test-C4X7hChn', document.currentScript && document.currentScript.src || document.baseURI).href));",
      "originalLength": 102,
      "removedExports": [],
      "renderedExports": [],
      "renderedLength": 285
    }
  },
  "referencedFiles": [
    "asset-test-C4X7hChn"
  ]
});
console.log('all chunks', ["entry-main1-s6RHXqBe.js","entry-main2-DPo9-iBy.js","chunk-dep2-DaLIbws0.js"])
console.log('referenced asset in renderChunk', 'asset-test-C4X7hChn');
