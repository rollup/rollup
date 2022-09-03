import { n as num$1 } from './chunk-dep2-452db20e2.js';

var num = 1;
console.log('referenced asset', new URL('asset-test-9f86d0818', import.meta.url).href);

console.log(num + num$1);
console.log('referenced asset', new URL('asset-test-9f86d0818', import.meta.url).href);
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
  "fileName": "entry-main1-9c60f0cdf.js",
  "implicitlyLoadedBefore": [],
  "importedBindings": {
    "chunk-dep2-452db20e2.js": [
      "n"
    ]
  },
  "imports": [
    "chunk-dep2-452db20e2.js"
  ],
  "modules": {
    "**/dep1.js": {
      "code": "var num = 1;\nconsole.log('referenced asset', new URL('asset-test-9f86d0818', import.meta.url).href);",
      "originalLength": 19,
      "removedExports": [],
      "renderedExports": [
        "num"
      ],
      "renderedLength": 100
    },
    "**/main1.js": {
      "code": "console.log(num + num$1);\nconsole.log('referenced asset', new URL('asset-test-9f86d0818', import.meta.url).href);",
      "originalLength": 102,
      "removedExports": [],
      "renderedExports": [],
      "renderedLength": 113
    }
  },
  "referencedFiles": [
    "asset-test-9f86d0818"
  ]
});
console.log('all chunks', ["entry-main1-9c60f0cdf.js","chunk-dep2-452db20e2.js","entry-main2-8b36dada6.js"])
console.log('referenced asset in renderChunk', 'asset-test-9f86d0818');
