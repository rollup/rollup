import { n as num$1 } from './chunk-dep2-BeJ9ci04.js';

var num = 3;
console.log('referenced asset', new URL('asset-test-C4X7hChn', import.meta.url).href);

console.log(num$1 + num);
console.log('referenced asset', new URL('asset-test-C4X7hChn', import.meta.url).href);
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
  "fileName": "entry-main2-BlxJSDFz.js",
  "implicitlyLoadedBefore": [],
  "importedBindings": {
    "chunk-dep2-BeJ9ci04.js": [
      "n"
    ]
  },
  "imports": [
    "chunk-dep2-BeJ9ci04.js"
  ],
  "modules": {
    "**/dep3.js": {
      "code": "var num = 3;\nconsole.log('referenced asset', new URL('asset-test-C4X7hChn', import.meta.url).href);",
      "originalLength": 19,
      "removedExports": [],
      "renderedExports": [
        "num"
      ],
      "renderedLength": 99
    },
    "**/main2.js": {
      "code": "console.log(num$1 + num);\nconsole.log('referenced asset', new URL('asset-test-C4X7hChn', import.meta.url).href);",
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
console.log('all chunks', ["entry-main1-i5EHma1g.js","entry-main2-BlxJSDFz.js","chunk-dep2-BeJ9ci04.js"])
console.log('referenced asset in renderChunk', 'asset-test-C4X7hChn');
