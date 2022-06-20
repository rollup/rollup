import { n as num$1 } from './chunk-dep2-76aefa22.js';

var num = 1;
console.log('referenced asset', new URL('asset-test-31f014b5', import.meta.url).href);

console.log(num + num$1);
console.log('referenced asset', new URL('asset-test-31f014b5', import.meta.url).href);
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
  "fileName": "entry-main1-8468b839.js",
  "implicitlyLoadedBefore": [],
  "importedBindings": {
    "chunk-dep2-76aefa22.js": [
      "n"
    ]
  },
  "imports": [
    "chunk-dep2-76aefa22.js"
  ],
  "modules": {
    "**/dep1.js": {
      "code": "var num = 1;\nconsole.log('referenced asset', new URL('asset-test-31f014b5', import.meta.url).href);",
      "originalLength": 19,
      "removedExports": [],
      "renderedExports": [
        "num"
      ],
      "renderedLength": 99
    },
    "**/main1.js": {
      "code": "console.log(num + num$1);\nconsole.log('referenced asset', new URL('asset-test-31f014b5', import.meta.url).href);",
      "originalLength": 102,
      "removedExports": [],
      "renderedExports": [],
      "renderedLength": 112
    }
  },
  "referencedFiles": [
    "asset-test-31f014b5"
  ]
});
console.log('all chunks', ["entry-main1-8468b839.js","chunk-dep2-76aefa22.js","entry-main2-e4148727.js"])
console.log('referenced asset in renderChunk', 'asset-test-31f014b5');
