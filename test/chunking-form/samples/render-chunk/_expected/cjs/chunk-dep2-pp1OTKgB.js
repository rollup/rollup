'use strict';

var num = 2;
console.log('referenced asset', (typeof document === 'undefined' ? require('u' + 'rl').pathToFileURL(__dirname + '/asset-test-C4X7hChn').href : new URL('asset-test-C4X7hChn', document.currentScript && document.currentScript.tagName.toUpperCase() === 'SCRIPT' && document.currentScript.src || document.baseURI).href));

exports.num = num;
console.log({
  "exports": [
    "num"
  ],
  "facadeModuleAttributes": {},
  "facadeModuleId": null,
  "facadeModuleRawId": null,
  "isDynamicEntry": false,
  "isEntry": false,
  "isImplicitEntry": false,
  "moduleIds": [
    "**/dep2.js"
  ],
  "name": "dep2",
  "type": "chunk",
  "dynamicImports": [],
  "fileName": "chunk-dep2-pp1OTKgB.js",
  "implicitlyLoadedBefore": [],
  "importedBindings": {},
  "imports": [],
  "modules": {
    "**/dep2.js": {
      "attributes": {},
      "code": "var num = 2;\nconsole.log('referenced asset', (typeof document === 'undefined' ? require('u' + 'rl').pathToFileURL(__dirname + '/asset-test-C4X7hChn').href : new URL('asset-test-C4X7hChn', document.currentScript && document.currentScript.tagName.toUpperCase() === 'SCRIPT' && document.currentScript.src || document.baseURI).href));",
      "originalLength": 19,
      "rawId": "**/dep2.js",
      "removedExports": [],
      "renderedExports": [
        "num"
      ],
      "renderedLength": 330
    }
  },
  "referencedFiles": [
    "asset-test-C4X7hChn"
  ]
});
console.log('all chunks', ["entry-main1-DYyFo87S.js","entry-main2-XryCnX1N.js","chunk-dep2-pp1OTKgB.js"])
console.log('referenced asset in renderChunk', 'asset-test-C4X7hChn');
