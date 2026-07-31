System.register([], (function (exports, module) {
	'use strict';
	return {
		execute: (function () {

			var num = exports("n", 2);
			console.log('referenced asset', new URL('asset-test-C4X7hChn', module.meta.url).href);

		})
	};
}));
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
  "fileName": "chunk-dep2-B9YfStri.js",
  "implicitlyLoadedBefore": [],
  "importedBindings": {},
  "imports": [],
  "modules": {
    "**/dep2.js": {
      "attributes": {},
      "code": "\t\t\tvar num = exports(\"n\", 2);\n\t\t\tconsole.log('referenced asset', new URL('asset-test-C4X7hChn', module.meta.url).href);",
      "originalLength": 19,
      "rawId": "**/dep2.js",
      "removedExports": [],
      "renderedExports": [
        "num"
      ],
      "renderedLength": 113
    }
  },
  "referencedFiles": [
    "asset-test-C4X7hChn"
  ]
});
console.log('all chunks', ["entry-main1-DY1Bhs3H.js","entry-main2-D7FDn8XG.js","chunk-dep2-B9YfStri.js"])
console.log('referenced asset in renderChunk', 'asset-test-C4X7hChn');
