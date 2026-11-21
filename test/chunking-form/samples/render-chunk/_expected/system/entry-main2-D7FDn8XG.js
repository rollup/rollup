System.register(['./chunk-dep2-B9YfStri.js'], (function (exports, module) {
	'use strict';
	var num$1;
	return {
		setters: [function (module) {
			num$1 = module.n;
		}],
		execute: (function () {

			var num = 3;
			console.log('referenced asset', new URL('asset-test-C4X7hChn', module.meta.url).href);

			console.log(num$1 + num);
			console.log('referenced asset', new URL('asset-test-C4X7hChn', module.meta.url).href);

		})
	};
}));
console.log({
  "exports": [],
  "facadeModuleAttributes": {},
  "facadeModuleId": "**/main2.js",
  "facadeModuleRawId": "**/main2.js",
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
  "fileName": "entry-main2-D7FDn8XG.js",
  "implicitlyLoadedBefore": [],
  "importedBindings": {
    "chunk-dep2-B9YfStri.js": [
      "n"
    ]
  },
  "imports": [
    "chunk-dep2-B9YfStri.js"
  ],
  "modules": {
    "**/dep3.js": {
      "attributes": {},
      "code": "\t\t\tvar num = 3;\n\t\t\tconsole.log('referenced asset', new URL('asset-test-C4X7hChn', module.meta.url).href);",
      "originalLength": 19,
      "rawId": "**/dep3.js",
      "removedExports": [],
      "renderedExports": [
        "num"
      ],
      "renderedLength": 99
    },
    "**/main2.js": {
      "attributes": {},
      "code": "\t\t\tconsole.log(num$1 + num);\n\t\t\tconsole.log('referenced asset', new URL('asset-test-C4X7hChn', module.meta.url).href);",
      "originalLength": 102,
      "rawId": "**/main2.js",
      "removedExports": [],
      "renderedExports": [],
      "renderedLength": 112
    }
  },
  "referencedFiles": [
    "asset-test-C4X7hChn"
  ]
});
console.log('all chunks', ["entry-main1-DY1Bhs3H.js","entry-main2-D7FDn8XG.js","chunk-dep2-B9YfStri.js"])
console.log('referenced asset in renderChunk', 'asset-test-C4X7hChn');
