System.register(['./chunk-dep2-B9YfStri.js'], (function (exports, module) {
	'use strict';
	var num$1;
	return {
		setters: [function (module) {
			num$1 = module.n;
		}],
		execute: (function () {

			var num = 1;
			console.log('referenced asset', new URL('asset-test-C4X7hChn', module.meta.url).href);

			console.log(num + num$1);
			console.log('referenced asset', new URL('asset-test-C4X7hChn', module.meta.url).href);

		})
	};
}));
console.log({
  "exports": [],
  "facadeModuleAttributes": {},
  "facadeModuleId": "**/main1.js",
  "facadeModuleRawId": "**/main1.js",
  "isDynamicEntry": false,
  "isEntry": true,
  "isImplicitEntry": false,
  "moduleIds": [
    "**/dep1.js",
    "**/main1.js"
  ],
  "name": "main1",
  "type": "chunk",
  "dynamicImports": [],
  "fileName": "entry-main1-DY1Bhs3H.js",
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
    "**/dep1.js": {
      "attributes": {},
      "code": "\t\t\tvar num = 1;\n\t\t\tconsole.log('referenced asset', new URL('asset-test-C4X7hChn', module.meta.url).href);",
      "originalLength": 19,
      "rawId": "**/dep1.js",
      "removedExports": [],
      "renderedExports": [
        "num"
      ],
      "renderedLength": 99
    },
    "**/main1.js": {
      "attributes": {},
      "code": "\t\t\tconsole.log(num + num$1);\n\t\t\tconsole.log('referenced asset', new URL('asset-test-C4X7hChn', module.meta.url).href);",
      "originalLength": 102,
      "rawId": "**/main1.js",
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
