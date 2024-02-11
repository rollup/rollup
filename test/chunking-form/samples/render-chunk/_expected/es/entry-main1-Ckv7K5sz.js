import { n as num$1 } from './chunk-dep2-CQDaPkp1.js';

var num = 1;
console.log('referenced asset', new URL('asset-test-C4X7hChn', import.meta.url).href);

console.log(num + num$1);
console.log('referenced asset', new URL('asset-test-C4X7hChn', import.meta.url).href);
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
  "fileName": "entry-main1-Ckv7K5sz.js",
  "implicitlyLoadedBefore": [],
  "importedBindings": {
    "chunk-dep2-CQDaPkp1.js": [
      "n"
    ]
  },
  "imports": [
    "chunk-dep2-CQDaPkp1.js"
  ],
  "modules": {
    "**/dep1.js": {
      "code": "var num = 1;\nconsole.log('referenced asset', new URL('asset-test-C4X7hChn', import.meta.url).href);",
      "originalLength": 19,
      "removedExports": [],
      "renderedExports": [
        "num"
      ],
      "renderedLength": 99
    },
    "**/main1.js": {
      "code": "console.log(num + num$1);\nconsole.log('referenced asset', new URL('asset-test-C4X7hChn', import.meta.url).href);",
      "originalLength": 102,
      "removedExports": [],
      "renderedExports": [],
      "renderedLength": 112
    }
  },
  "referencedFiles": [
    "asset-test-C4X7hChn"
  ]
});
console.log('all chunks', ["entry-main1-Ckv7K5sz.js","entry-main2-Ckd5ikIS.js","chunk-dep2-CQDaPkp1.js"])
console.log('referenced asset in renderChunk', 'asset-test-C4X7hChn');
