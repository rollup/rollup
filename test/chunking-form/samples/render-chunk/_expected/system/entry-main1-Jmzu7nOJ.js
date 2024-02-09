System.register(['./chunk-dep2-C9ddpexS.js'], (function (exports, module) {
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
  "facadeModuleId": "**/main1.js",
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
  "fileName": "entry-main1-Jmzu7nOJ.js",
  "implicitlyLoadedBefore": [],
  "importedBindings": {
    "chunk-dep2-C9ddpexS.js": [
      "n"
    ]
  },
  "imports": [
    "chunk-dep2-C9ddpexS.js"
  ],
  "modules": {
    "**/dep1.js": {
      "code": "\t\t\tvar num = 1;\n\t\t\tconsole.log('referenced asset', new URL('asset-test-C4X7hChn', module.meta.url).href);",
      "originalLength": 19,
      "removedExports": [],
      "renderedExports": [
        "num"
      ],
      "renderedLength": 99
    },
    "**/main1.js": {
      "code": "\t\t\tconsole.log(num + num$1);\n\t\t\tconsole.log('referenced asset', new URL('asset-test-C4X7hChn', module.meta.url).href);",
      "originalLength": 102,
      "removedExports": [],
      "renderedExports": [],
      "renderedLength": 112
    }
  },
  "referencedFiles": [
    "asset-test-C4X7hChn"
  ]
});
console.log('all chunks', ["entry-main1-Jmzu7nOJ.js","entry-main2-ByL47NtH.js","chunk-dep2-C9ddpexS.js"])
console.log('referenced asset in renderChunk', 'asset-test-C4X7hChn');
