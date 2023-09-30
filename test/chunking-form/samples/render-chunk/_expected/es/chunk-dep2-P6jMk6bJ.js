var num = 2;
console.log('referenced asset', new URL('asset-test-uF-4QoZ1', import.meta.url).href);

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
  "fileName": "chunk-dep2-P6jMk6bJ.js",
  "implicitlyLoadedBefore": [],
  "importedBindings": {},
  "imports": [],
  "modules": {
    "**/dep2.js": {
      "code": "var num = 2;\nconsole.log('referenced asset', new URL('asset-test-uF-4QoZ1', import.meta.url).href);",
      "originalLength": 19,
      "removedExports": [],
      "renderedExports": [
        "num"
      ],
      "renderedLength": 99
    }
  },
  "referencedFiles": [
    "asset-test-uF-4QoZ1"
  ]
});
console.log('all chunks', ["entry-main1--LupZW-p.js","entry-main2-wXJ52_9X.js","chunk-dep2-P6jMk6bJ.js"])
console.log('referenced asset in renderChunk', 'asset-test-uF-4QoZ1');
