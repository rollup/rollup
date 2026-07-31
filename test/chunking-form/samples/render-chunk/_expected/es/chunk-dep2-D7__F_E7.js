var num = 2;
console.log('referenced asset', new URL('asset-test-C4X7hChn', import.meta.url).href);

export { num as n };
console.log({
  "exports": [
    "n"
  ],
  "facadeModuleAttributes": {},
  "facadeModuleId": null,
  "facadeModuleRawId": null,
  "isDynamicEntry": false,
  "isEntry": false,
  "isImplicitEntry": false,
  "moduleIds": [
    "**/dep2.js"
  ],
  "name": "dep2",
  "type": "chunk",
  "dynamicImports": [],
  "fileName": "chunk-dep2-D7__F_E7.js",
  "implicitlyLoadedBefore": [],
  "importedBindings": {},
  "imports": [],
  "modules": {
    "**/dep2.js": {
      "attributes": {},
      "code": "var num = 2;\nconsole.log('referenced asset', new URL('asset-test-C4X7hChn', import.meta.url).href);",
      "originalLength": 19,
      "rawId": "**/dep2.js",
      "removedExports": [],
      "renderedExports": [
        "num"
      ],
      "renderedLength": 99
    }
  },
  "referencedFiles": [
    "asset-test-C4X7hChn"
  ]
});
console.log('all chunks', ["entry-main1-C-iRhIpp.js","entry-main2-Bh_stKdu.js","chunk-dep2-D7__F_E7.js"])
console.log('referenced asset in renderChunk', 'asset-test-C4X7hChn');
