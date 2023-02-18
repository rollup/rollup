'use strict';

var dep2 = require('./chunk-dep2-d1b4d6a3.js');

var num = 1;
console.log('referenced asset', (typeof document === 'undefined' ? new (require('u' + 'rl').URL)('file:' + __dirname + '/asset-test-9f86d081').href : new URL('asset-test-9f86d081', document.currentScript && document.currentScript.src || document.baseURI).href));

console.log(num + dep2.num);
console.log('referenced asset', (typeof document === 'undefined' ? new (require('u' + 'rl').URL)('file:' + __dirname + '/asset-test-9f86d081').href : new URL('asset-test-9f86d081', document.currentScript && document.currentScript.src || document.baseURI).href));
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
  "fileName": "entry-main1-7c0fb7d4.js",
  "implicitlyLoadedBefore": [],
  "importedBindings": {
    "chunk-dep2-d1b4d6a3.js": [
      "num"
    ]
  },
  "imports": [
    "chunk-dep2-d1b4d6a3.js"
  ],
  "modules": {
    "**/dep1.js": {
      "code": "var num = 1;\nconsole.log('referenced asset', (typeof document === 'undefined' ? new (require('u' + 'rl').URL)('file:' + __dirname + '/asset-test-9f86d081').href : new URL('asset-test-9f86d081', document.currentScript && document.currentScript.src || document.baseURI).href));",
      "originalLength": 19,
      "removedExports": [],
      "renderedExports": [
        "num"
      ],
      "renderedLength": 275
    },
    "**/main1.js": {
      "code": "console.log(num + dep2.num);\nconsole.log('referenced asset', (typeof document === 'undefined' ? new (require('u' + 'rl').URL)('file:' + __dirname + '/asset-test-9f86d081').href : new URL('asset-test-9f86d081', document.currentScript && document.currentScript.src || document.baseURI).href));",
      "originalLength": 102,
      "removedExports": [],
      "renderedExports": [],
      "renderedLength": 291
    }
  },
  "referencedFiles": [
    "asset-test-9f86d081"
  ]
});
console.log('all chunks', ["entry-main1-7c0fb7d4.js","entry-main2-51ea6de1.js","chunk-dep2-d1b4d6a3.js"])
console.log('referenced asset in renderChunk', 'asset-test-9f86d081');
