'use strict';

var dep2 = require('./chunk-dep2-pp1OTKgB.js');

var num = 3;
console.log('referenced asset', (typeof document === 'undefined' ? require('u' + 'rl').pathToFileURL(__dirname + '/asset-test-C4X7hChn').href : new URL('asset-test-C4X7hChn', document.currentScript && document.currentScript.tagName.toUpperCase() === 'SCRIPT' && document.currentScript.src || document.baseURI).href));

console.log(dep2.num + num);
console.log('referenced asset', (typeof document === 'undefined' ? require('u' + 'rl').pathToFileURL(__dirname + '/asset-test-C4X7hChn').href : new URL('asset-test-C4X7hChn', document.currentScript && document.currentScript.tagName.toUpperCase() === 'SCRIPT' && document.currentScript.src || document.baseURI).href));
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
  "fileName": "entry-main2-XryCnX1N.js",
  "implicitlyLoadedBefore": [],
  "importedBindings": {
    "chunk-dep2-pp1OTKgB.js": [
      "num"
    ]
  },
  "imports": [
    "chunk-dep2-pp1OTKgB.js"
  ],
  "modules": {
    "**/dep3.js": {
      "attributes": {},
      "code": "var num = 3;\nconsole.log('referenced asset', (typeof document === 'undefined' ? require('u' + 'rl').pathToFileURL(__dirname + '/asset-test-C4X7hChn').href : new URL('asset-test-C4X7hChn', document.currentScript && document.currentScript.tagName.toUpperCase() === 'SCRIPT' && document.currentScript.src || document.baseURI).href));",
      "originalLength": 19,
      "rawId": "**/dep3.js",
      "removedExports": [],
      "renderedExports": [
        "num"
      ],
      "renderedLength": 330
    },
    "**/main2.js": {
      "attributes": {},
      "code": "console.log(dep2.num + num);\nconsole.log('referenced asset', (typeof document === 'undefined' ? require('u' + 'rl').pathToFileURL(__dirname + '/asset-test-C4X7hChn').href : new URL('asset-test-C4X7hChn', document.currentScript && document.currentScript.tagName.toUpperCase() === 'SCRIPT' && document.currentScript.src || document.baseURI).href));",
      "originalLength": 102,
      "rawId": "**/main2.js",
      "removedExports": [],
      "renderedExports": [],
      "renderedLength": 346
    }
  },
  "referencedFiles": [
    "asset-test-C4X7hChn"
  ]
});
console.log('all chunks', ["entry-main1-DYyFo87S.js","entry-main2-XryCnX1N.js","chunk-dep2-pp1OTKgB.js"])
console.log('referenced asset in renderChunk', 'asset-test-C4X7hChn');
