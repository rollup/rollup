'use strict';

var dep2 = require('./chunk-dep2-8d89c265.js');

var num = 1;
console.log('referenced asset', (typeof document === 'undefined' ? require('u' + 'rl').pathToFileURL(__dirname + '/asset-test-9f86d081').href : new URL('asset-test-9f86d081', document.currentScript && document.currentScript.src || document.baseURI).href));

console.log(num + dep2.num);
console.log('referenced asset', (typeof document === 'undefined' ? require('u' + 'rl').pathToFileURL(__dirname + '/asset-test-9f86d081').href : new URL('asset-test-9f86d081', document.currentScript && document.currentScript.src || document.baseURI).href));
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
  "fileName": "entry-main1-5be92ae4.js",
  "implicitlyLoadedBefore": [],
  "importedBindings": {
    "chunk-dep2-8d89c265.js": [
      "num"
    ]
  },
  "imports": [
    "chunk-dep2-8d89c265.js"
  ],
  "modules": {
    "**/dep1.js": {
      "code": "var num = 1;\nconsole.log('referenced asset', (typeof document === 'undefined' ? require('u' + 'rl').pathToFileURL(__dirname + '/asset-test-9f86d081').href : new URL('asset-test-9f86d081', document.currentScript && document.currentScript.src || document.baseURI).href));",
      "originalLength": 19,
      "removedExports": [],
      "renderedExports": [
        "num"
      ],
      "renderedLength": 269
    },
    "**/main1.js": {
      "code": "console.log(num + dep2.num);\nconsole.log('referenced asset', (typeof document === 'undefined' ? require('u' + 'rl').pathToFileURL(__dirname + '/asset-test-9f86d081').href : new URL('asset-test-9f86d081', document.currentScript && document.currentScript.src || document.baseURI).href));",
      "originalLength": 102,
      "removedExports": [],
      "renderedExports": [],
      "renderedLength": 285
    }
  },
  "referencedFiles": [
    "asset-test-9f86d081"
  ]
});
console.log('all chunks', ["entry-main1-5be92ae4.js","entry-main2-20c5a0f4.js","chunk-dep2-8d89c265.js"])
console.log('referenced asset in renderChunk', 'asset-test-9f86d081');
