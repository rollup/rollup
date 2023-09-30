'use strict';

var num = 2;
console.log('referenced asset', (typeof document === 'undefined' ? require('u' + 'rl').pathToFileURL(__dirname + '/asset-test-uF-4QoZ1').href : new URL('asset-test-uF-4QoZ1', document.currentScript && document.currentScript.src || document.baseURI).href));

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
  "fileName": "chunk-dep2-XPNbbDh-.js",
  "implicitlyLoadedBefore": [],
  "importedBindings": {},
  "imports": [],
  "modules": {
    "**/dep2.js": {
      "code": "var num = 2;\nconsole.log('referenced asset', (typeof document === 'undefined' ? require('u' + 'rl').pathToFileURL(__dirname + '/asset-test-uF-4QoZ1').href : new URL('asset-test-uF-4QoZ1', document.currentScript && document.currentScript.src || document.baseURI).href));",
      "originalLength": 19,
      "removedExports": [],
      "renderedExports": [
        "num"
      ],
      "renderedLength": 269
    }
  },
  "referencedFiles": [
    "asset-test-uF-4QoZ1"
  ]
});
console.log('all chunks', ["entry-main1-zV-9xTLy.js","entry-main2-urBx_vfo.js","chunk-dep2-XPNbbDh-.js"])
console.log('referenced asset in renderChunk', 'asset-test-uF-4QoZ1');
