System.register([], (function (exports, module) {
	'use strict';
	return {
		execute: (function () {

			var num = exports('n', 2);
			console.log('referenced asset', new URL('asset-test-9f86d0818', module.meta.url).href);

		})
	};
}));
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
  "fileName": "chunk-dep2-e734956e2.js",
  "implicitlyLoadedBefore": [],
  "importedBindings": {},
  "imports": [],
  "modules": {
    "**/dep2.js": {
      "code": "\t\t\tvar num = exports('n', 2);\n\t\t\tconsole.log('referenced asset', new URL('asset-test-9f86d0818', module.meta.url).href);",
      "originalLength": 19,
      "removedExports": [],
      "renderedExports": [
        "num"
      ],
      "renderedLength": 114
    }
  },
  "referencedFiles": [
    "asset-test-9f86d0818"
  ]
});
console.log('all chunks', ["entry-main1-a5eeb6cbd.js","chunk-dep2-e734956e2.js","entry-main2-0e66ce5ec.js"])
console.log('referenced asset in renderChunk', 'asset-test-9f86d0818');
