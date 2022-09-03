var num = 2;
console.log('referenced asset', new URL('asset-test-9f86d0818', import.meta.url).href);

export { num as n };
console.log({
  "exports": [
    "n"
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
  "fileName": "chunk-dep2-452db20e2.js",
  "implicitlyLoadedBefore": [],
  "importedBindings": {},
  "imports": [],
  "modules": {
    "**/dep2.js": {
      "code": "var num = 2;\nconsole.log('referenced asset', new URL('asset-test-9f86d0818', import.meta.url).href);",
      "originalLength": 19,
      "removedExports": [],
      "renderedExports": [
        "num"
      ],
      "renderedLength": 100
    }
  },
  "referencedFiles": [
    "asset-test-9f86d0818"
  ]
});
console.log('all chunks', ["entry-main1-9c60f0cdf.js","chunk-dep2-452db20e2.js","entry-main2-8b36dada6.js"])
console.log('referenced asset in renderChunk', 'asset-test-9f86d0818');
