System.register(['./chunk-dep2-tTS3nOMy.js'], (function (exports, module) {
	'use strict';
	var num$1;
	return {
		setters: [function (module) {
			num$1 = module.n;
		}],
		execute: (function () {

			var num = 1;
			console.log('referenced asset', new URL('asset-test-uF-4QoZ1', module.meta.url).href);

			console.log(num + num$1);
			console.log('referenced asset', new URL('asset-test-uF-4QoZ1', module.meta.url).href);

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
  "fileName": "entry-main1-j8-hK8pw.js",
  "implicitlyLoadedBefore": [],
  "importedBindings": {
    "chunk-dep2-tTS3nOMy.js": [
      "n"
    ]
  },
  "imports": [
    "chunk-dep2-tTS3nOMy.js"
  ],
  "modules": {
    "**/dep1.js": {
      "code": "\t\t\tvar num = 1;\n\t\t\tconsole.log('referenced asset', new URL('asset-test-uF-4QoZ1', module.meta.url).href);",
      "originalLength": 19,
      "removedExports": [],
      "renderedExports": [
        "num"
      ],
      "renderedLength": 99
    },
    "**/main1.js": {
      "code": "\t\t\tconsole.log(num + num$1);\n\t\t\tconsole.log('referenced asset', new URL('asset-test-uF-4QoZ1', module.meta.url).href);",
      "originalLength": 102,
      "removedExports": [],
      "renderedExports": [],
      "renderedLength": 112
    }
  },
  "referencedFiles": [
    "asset-test-uF-4QoZ1"
  ]
});
console.log('all chunks', ["entry-main1-j8-hK8pw.js","entry-main2-Y97yXNTt.js","chunk-dep2-tTS3nOMy.js"])
console.log('referenced asset in renderChunk', 'asset-test-uF-4QoZ1');
