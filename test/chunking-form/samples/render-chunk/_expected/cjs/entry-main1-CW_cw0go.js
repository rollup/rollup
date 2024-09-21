'use strict';

var dep2 = require('./chunk-dep2-Cr_zOuBy.js');

var num = 1;
console.log('referenced asset', (typeof document === 'undefined' ? require('u' + 'rl').pathToFileURL(__dirname + '/asset-test-C4X7hChn').href : new URL('asset-test-C4X7hChn', document.currentScript && document.currentScript.tagName.toUpperCase() === 'SCRIPT' && document.currentScript.src || document.baseURI).href));

console.log(num + dep2.num);
console.log('referenced asset', (typeof document === 'undefined' ? require('u' + 'rl').pathToFileURL(__dirname + '/asset-test-C4X7hChn').href : new URL('asset-test-C4X7hChn', document.currentScript && document.currentScript.tagName.toUpperCase() === 'SCRIPT' && document.currentScript.src || document.baseURI).href));
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
  "fileName": "entry-main1-CW_cw0go.js",
  "implicitlyLoadedBefore": [],
  "importedBindings": {
    "chunk-dep2-Cr_zOuBy.js": [
      "num"
    ]
  },
  "imports": [
    "chunk-dep2-Cr_zOuBy.js"
  ],
  "modules": {
    "**/dep1.js": {
      "code": "var num = 1;\nconsole.log('referenced asset', (typeof document === 'undefined' ? require('u' + 'rl').pathToFileURL(__dirname + '/asset-test-C4X7hChn').href : new URL('asset-test-C4X7hChn', document.currentScript && document.currentScript.tagName.toUpperCase() === 'SCRIPT' && document.currentScript.src || document.baseURI).href));",
      "originalLength": 19,
      "removedExports": [],
      "renderedExports": [
        "num"
      ],
      "renderedLength": 330
    },
    "**/main1.js": {
      "code": "console.log(num + dep2.num);\nconsole.log('referenced asset', (typeof document === 'undefined' ? require('u' + 'rl').pathToFileURL(__dirname + '/asset-test-C4X7hChn').href : new URL('asset-test-C4X7hChn', document.currentScript && document.currentScript.tagName.toUpperCase() === 'SCRIPT' && document.currentScript.src || document.baseURI).href));",
      "originalLength": 102,
      "removedExports": [],
      "renderedExports": [],
      "renderedLength": 346
    }
  },
  "referencedFiles": [
    "asset-test-C4X7hChn"
  ]
});
console.log('all chunks', ["entry-main1-CW_cw0go.js","entry-main2-CvqsXhWd.js","chunk-dep2-Cr_zOuBy.js"])
console.log('referenced asset in renderChunk', 'asset-test-C4X7hChn');
