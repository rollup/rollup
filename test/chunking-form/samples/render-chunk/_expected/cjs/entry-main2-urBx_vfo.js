'use strict';

var dep2 = require('./chunk-dep2-XPNbbDh-.js');

var num = 3;
console.log('referenced asset', (typeof document === 'undefined' ? require('u' + 'rl').pathToFileURL(__dirname + '/asset-test-uF-4QoZ1').href : new URL('asset-test-uF-4QoZ1', document.currentScript && document.currentScript.src || document.baseURI).href));

console.log(dep2.num + num);
console.log('referenced asset', (typeof document === 'undefined' ? require('u' + 'rl').pathToFileURL(__dirname + '/asset-test-uF-4QoZ1').href : new URL('asset-test-uF-4QoZ1', document.currentScript && document.currentScript.src || document.baseURI).href));
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
  "fileName": "entry-main2-urBx_vfo.js",
  "implicitlyLoadedBefore": [],
  "importedBindings": {
    "chunk-dep2-XPNbbDh-.js": [
      "num"
    ]
  },
  "imports": [
    "chunk-dep2-XPNbbDh-.js"
  ],
  "modules": {
    "**/dep3.js": {
      "code": "var num = 3;\nconsole.log('referenced asset', (typeof document === 'undefined' ? require('u' + 'rl').pathToFileURL(__dirname + '/asset-test-uF-4QoZ1').href : new URL('asset-test-uF-4QoZ1', document.currentScript && document.currentScript.src || document.baseURI).href));",
      "originalLength": 19,
      "removedExports": [],
      "renderedExports": [
        "num"
      ],
      "renderedLength": 269
    },
    "**/main2.js": {
      "code": "console.log(dep2.num + num);\nconsole.log('referenced asset', (typeof document === 'undefined' ? require('u' + 'rl').pathToFileURL(__dirname + '/asset-test-uF-4QoZ1').href : new URL('asset-test-uF-4QoZ1', document.currentScript && document.currentScript.src || document.baseURI).href));",
      "originalLength": 102,
      "removedExports": [],
      "renderedExports": [],
      "renderedLength": 285
    }
  },
  "referencedFiles": [
    "asset-test-uF-4QoZ1"
  ]
});
console.log('all chunks', ["entry-main1-zV-9xTLy.js","entry-main2-urBx_vfo.js","chunk-dep2-XPNbbDh-.js"])
console.log('referenced asset in renderChunk', 'asset-test-uF-4QoZ1');
