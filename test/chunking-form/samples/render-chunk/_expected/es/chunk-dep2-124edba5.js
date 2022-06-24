var num = 2;
console.log('referenced asset', new URL('asset-test-9f86d081', import.meta.url).href);

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
  "fileName": "chunk-dep2-124edba5.js",
  "implicitlyLoadedBefore": [],
  "importedBindings": {},
  "imports": [],
  "modules": {
    "**/dep2.js": {
      "code": "var num = 2;\nconsole.log('referenced asset', new URL('asset-test-9f86d081', import.meta.url).href);",
      "originalLength": 19,
      "removedExports": [],
      "renderedExports": [
        "num"
      ],
      "renderedLength": 99
    }
  },
  "referencedFiles": [
    "asset-test-9f86d081"
  ]
});
console.log('all chunks', ["entry-main1-b12147aa.js","chunk-dep2-124edba5.js","entry-main2-09746024.js"])
console.log('referenced asset in renderChunk', 'asset-test-9f86d081');
