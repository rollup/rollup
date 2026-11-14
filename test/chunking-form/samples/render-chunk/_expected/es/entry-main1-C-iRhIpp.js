import { n as num$1 } from './chunk-dep2-D7__F_E7.js';

var num = 1;
console.log('referenced asset', new URL('asset-test-C4X7hChn', import.meta.url).href);

console.log(num + num$1);
console.log('referenced asset', new URL('asset-test-C4X7hChn', import.meta.url).href);
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
  "fileName": "entry-main1-C-iRhIpp.js",
  "implicitlyLoadedBefore": [],
  "importedBindings": {
    "chunk-dep2-D7__F_E7.js": [
      "n"
    ]
  },
  "imports": [
    "chunk-dep2-D7__F_E7.js"
  ],
  "modules": {
    "**/dep1.js": {
      "attributes": {},
      "code": "var num = 1;\nconsole.log('referenced asset', new URL('asset-test-C4X7hChn', import.meta.url).href);",
      "originalLength": 19,
      "rawId": "**/dep1.js",
      "removedExports": [],
      "renderedExports": [
        "num"
      ],
      "renderedLength": 99
    },
    "**/main1.js": {
      "attributes": {},
      "code": "console.log(num + num$1);\nconsole.log('referenced asset', new URL('asset-test-C4X7hChn', import.meta.url).href);",
      "originalLength": 102,
      "rawId": "**/main1.js",
      "removedExports": [],
      "renderedExports": [],
      "renderedLength": 112
    }
  },
  "referencedFiles": [
    "asset-test-C4X7hChn"
  ]
});
console.log('all chunks', ["entry-main1-C-iRhIpp.js","entry-main2-Bh_stKdu.js","chunk-dep2-D7__F_E7.js"])
console.log('referenced asset in renderChunk', 'asset-test-C4X7hChn');
