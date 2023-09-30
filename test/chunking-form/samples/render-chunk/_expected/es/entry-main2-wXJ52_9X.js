import { n as num$1 } from './chunk-dep2-P6jMk6bJ.js';

var num = 3;
console.log('referenced asset', new URL('asset-test-uF-4QoZ1', import.meta.url).href);

console.log(num$1 + num);
console.log('referenced asset', new URL('asset-test-uF-4QoZ1', import.meta.url).href);
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
  "fileName": "entry-main2-wXJ52_9X.js",
  "implicitlyLoadedBefore": [],
  "importedBindings": {
    "chunk-dep2-P6jMk6bJ.js": [
      "n"
    ]
  },
  "imports": [
    "chunk-dep2-P6jMk6bJ.js"
  ],
  "modules": {
    "**/dep3.js": {
      "code": "var num = 3;\nconsole.log('referenced asset', new URL('asset-test-uF-4QoZ1', import.meta.url).href);",
      "originalLength": 19,
      "removedExports": [],
      "renderedExports": [
        "num"
      ],
      "renderedLength": 99
    },
    "**/main2.js": {
      "code": "console.log(num$1 + num);\nconsole.log('referenced asset', new URL('asset-test-uF-4QoZ1', import.meta.url).href);",
      "originalLength": 102,
      "removedExports": [],
      "renderedExports": [],
      "renderedLength": 112
    }
  },
  "referencedFiles": [
    "asset-test-uF-4QoZ1"
  ]
});
console.log('all chunks', ["entry-main1--LupZW-p.js","entry-main2-wXJ52_9X.js","chunk-dep2-P6jMk6bJ.js"])
console.log('referenced asset in renderChunk', 'asset-test-uF-4QoZ1');
