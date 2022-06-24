System.register(['./chunk-dep2-6579036d.js'], (function (exports, module) {
	'use strict';
	var num$1;
	return {
		setters: [function (module) {
			num$1 = module.n;
		}],
		execute: (function () {

			var num = 3;
			console.log('referenced asset', new URL('asset-test-9f86d081', module.meta.url).href);

			console.log(num$1 + num);
			console.log('referenced asset', new URL('asset-test-9f86d081', module.meta.url).href);

		})
	};
}));
console.log({
  "exports": [],
  "facadeModuleId": "**/main2.js",
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
  "fileName": "entry-main2-7bacea36.js",
  "implicitlyLoadedBefore": [],
  "importedBindings": {
    "chunk-dep2-6579036d.js": [
      "n"
    ]
  },
  "imports": [
    "chunk-dep2-6579036d.js"
  ],
  "modules": {
    "**/dep3.js": {
      "code": "\t\t\tvar num = 3;\n\t\t\tconsole.log('referenced asset', new URL('asset-test-9f86d081', module.meta.url).href);",
      "originalLength": 19,
      "removedExports": [],
      "renderedExports": [
        "num"
      ],
      "renderedLength": 99
    },
    "**/main2.js": {
      "code": "\t\t\tconsole.log(num$1 + num);\n\t\t\tconsole.log('referenced asset', new URL('asset-test-9f86d081', module.meta.url).href);",
      "originalLength": 102,
      "removedExports": [],
      "renderedExports": [],
      "renderedLength": 112
    }
  },
  "referencedFiles": [
    "asset-test-9f86d081"
  ]
});
console.log('all chunks', ["entry-main1-331def45.js","chunk-dep2-6579036d.js","entry-main2-7bacea36.js"])
console.log('referenced asset in renderChunk', 'asset-test-9f86d081');
