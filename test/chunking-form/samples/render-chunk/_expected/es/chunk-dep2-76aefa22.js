var num = 2;
console.log('referenced asset', new URL('asset-test-31f014b5', import.meta.url).href);

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
  "fileName": "chunk-dep2-76aefa22.js",
  "implicitlyLoadedBefore": [],
  "importedBindings": {},
  "imports": [],
  "modules": {
    "**/dep2.js": {
      "code": "var num = 2;\nconsole.log('referenced asset', new URL('asset-test-31f014b5', import.meta.url).href);",
      "originalLength": 19,
      "removedExports": [],
      "renderedExports": [
        "num"
      ],
      "renderedLength": 99
    }
  },
  "referencedFiles": [
    "asset-test-31f014b5"
  ]
});
console.log('all chunks', ["entry-main1-8468b839.js","chunk-dep2-76aefa22.js","entry-main2-e4148727.js"])
console.log('referenced asset in renderChunk', 'asset-test-31f014b5');
