var num = 2;
console.log('referenced asset', new URL('asset-test-k68mbkgb', import.meta.url).href);

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
  "fileName": "chunk-dep2-gjuy1txy.js",
  "implicitlyLoadedBefore": [],
  "importedBindings": {},
  "imports": [],
  "modules": {
    "**/dep2.js": {
      "code": "var num = 2;\nconsole.log('referenced asset', new URL('asset-test-k68mbkgb', import.meta.url).href);",
      "originalLength": 19,
      "removedExports": [],
      "renderedExports": [
        "num"
      ],
      "renderedLength": 99
    }
  },
  "referencedFiles": [
    "asset-test-k68mbkgb"
  ]
});
console.log('all chunks', ["entry-main1-e2ge55ci.js","entry-main2-ds0qmntw.js","chunk-dep2-gjuy1txy.js"])
console.log('referenced asset in renderChunk', 'asset-test-k68mbkgb');
