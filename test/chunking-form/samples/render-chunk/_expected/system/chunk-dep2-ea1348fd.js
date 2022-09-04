System.register([], (function (exports, module) {
	'use strict';
	return {
		execute: (function () {

			var num = exports('n', 2);
			console.log('referenced asset', new URL('asset-test-9f86d081', module.meta.url).href);

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
  "fileName": "chunk-dep2-ea1348fd.js",
  "implicitlyLoadedBefore": [],
  "importedBindings": {},
  "imports": [],
  "modules": {
    "**/dep2.js": {
      "code": "\t\t\tvar num = exports('n', 2);\n\t\t\tconsole.log('referenced asset', new URL('asset-test-9f86d081', module.meta.url).href);",
      "originalLength": 19,
      "removedExports": [],
      "renderedExports": [
        "num"
      ],
      "renderedLength": 113
    }
  },
  "referencedFiles": [
    "asset-test-9f86d081"
  ]
});
console.log('all chunks', ["entry-main1-118e1de4.js","chunk-dep2-ea1348fd.js","entry-main2-34191286.js"])
console.log('referenced asset in renderChunk', 'asset-test-9f86d081');
