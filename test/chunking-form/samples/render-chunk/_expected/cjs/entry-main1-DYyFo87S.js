'use strict';

var dep2 = require('./chunk-dep2-pp1OTKgB.js');

var num = 1;
console.log('referenced asset', (typeof document === 'undefined' ? require('u' + 'rl').pathToFileURL(__dirname + '/asset-test-C4X7hChn').href : new URL('asset-test-C4X7hChn', document.currentScript && document.currentScript.tagName.toUpperCase() === 'SCRIPT' && document.currentScript.src || document.baseURI).href));

console.log(num + dep2.num);
console.log('referenced asset', (typeof document === 'undefined' ? require('u' + 'rl').pathToFileURL(__dirname + '/asset-test-C4X7hChn').href : new URL('asset-test-C4X7hChn', document.currentScript && document.currentScript.tagName.toUpperCase() === 'SCRIPT' && document.currentScript.src || document.baseURI).href));
console.log({
  "exports": [],
  "facadeModuleAttributes": {},
  "facadeModuleId": "**/main1.js",
  "facadeModuleRawId": "**/main1.js",
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
  "fileName": "entry-main1-DYyFo87S.js",
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
    "**/dep1.js": {
      "attributes": {},
      "code": "var num = 1;\nconsole.log('referenced asset', (typeof document === 'undefined' ? require('u' + 'rl').pathToFileURL(__dirname + '/asset-test-C4X7hChn').href : new URL('asset-test-C4X7hChn', document.currentScript && document.currentScript.tagName.toUpperCase() === 'SCRIPT' && document.currentScript.src || document.baseURI).href));",
      "originalLength": 19,
      "rawId": "**/dep1.js",
      "removedExports": [],
      "renderedExports": [
        "num"
      ],
      "renderedLength": 330
    },
    "**/main1.js": {
      "attributes": {},
      "code": "console.log(num + dep2.num);\nconsole.log('referenced asset', (typeof document === 'undefined' ? require('u' + 'rl').pathToFileURL(__dirname + '/asset-test-C4X7hChn').href : new URL('asset-test-C4X7hChn', document.currentScript && document.currentScript.tagName.toUpperCase() === 'SCRIPT' && document.currentScript.src || document.baseURI).href));",
      "originalLength": 102,
      "rawId": "**/main1.js",
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
