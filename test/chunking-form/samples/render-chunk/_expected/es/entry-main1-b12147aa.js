import { n as num$1 } from './chunk-dep2-124edba5.js';

var num = 1;
console.log('referenced asset', new URL('asset-test-9f86d081', import.meta.url).href);

console.log(num + num$1);
console.log('referenced asset', new URL('asset-test-9f86d081', import.meta.url).href);
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
  "fileName": "entry-main1-b12147aa.js",
  "implicitlyLoadedBefore": [],
  "importedBindings": {
    "chunk-dep2-124edba5.js": [
      "n"
    ]
  },
  "imports": [
    "chunk-dep2-124edba5.js"
  ],
  "modules": {
    "**/dep1.js": {
      "code": "var num = 1;\nconsole.log('referenced asset', new URL('asset-test-9f86d081', import.meta.url).href);",
      "originalLength": 19,
      "removedExports": [],
      "renderedExports": [
        "num"
      ],
      "renderedLength": 99
    },
    "**/main1.js": {
      "code": "console.log(num + num$1);\nconsole.log('referenced asset', new URL('asset-test-9f86d081', import.meta.url).href);",
      "originalLength": 102,
      "removedExports": [],
      "renderedExports": [],
      "renderedLength": 112
    }
  },
  "referencedFiles": [
    "asset-test-9f86d081"
  ]
});
console.log('all chunks', ["entry-main1-b12147aa.js","chunk-dep2-124edba5.js","entry-main2-09746024.js"])
console.log('referenced asset in renderChunk', 'asset-test-9f86d081');
