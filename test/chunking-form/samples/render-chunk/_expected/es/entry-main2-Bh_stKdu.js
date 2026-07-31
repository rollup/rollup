import { n as num$1 } from './chunk-dep2-D7__F_E7.js';

var num = 3;
console.log('referenced asset', new URL('asset-test-C4X7hChn', import.meta.url).href);

console.log(num$1 + num);
console.log('referenced asset', new URL('asset-test-C4X7hChn', import.meta.url).href);
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
  "fileName": "entry-main2-Bh_stKdu.js",
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
    "**/dep3.js": {
      "attributes": {},
      "code": "var num = 3;\nconsole.log('referenced asset', new URL('asset-test-C4X7hChn', import.meta.url).href);",
      "originalLength": 19,
      "rawId": "**/dep3.js",
      "removedExports": [],
      "renderedExports": [
        "num"
      ],
      "renderedLength": 99
    },
    "**/main2.js": {
      "attributes": {},
      "code": "console.log(num$1 + num);\nconsole.log('referenced asset', new URL('asset-test-C4X7hChn', import.meta.url).href);",
      "originalLength": 102,
      "rawId": "**/main2.js",
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
