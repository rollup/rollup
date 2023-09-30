System.register([], (function (exports, module) {
	'use strict';
	return {
		execute: (function () {

			var num = exports('n', 2);
			console.log('referenced asset', new URL('asset-test-uF-4QoZ1', module.meta.url).href);

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
  "fileName": "chunk-dep2-tTS3nOMy.js",
  "implicitlyLoadedBefore": [],
  "importedBindings": {},
  "imports": [],
  "modules": {
    "**/dep2.js": {
      "code": "\t\t\tvar num = exports('n', 2);\n\t\t\tconsole.log('referenced asset', new URL('asset-test-uF-4QoZ1', module.meta.url).href);",
      "originalLength": 19,
      "removedExports": [],
      "renderedExports": [
        "num"
      ],
      "renderedLength": 113
    }
  },
  "referencedFiles": [
    "asset-test-uF-4QoZ1"
  ]
});
console.log('all chunks', ["entry-main1-j8-hK8pw.js","entry-main2-Y97yXNTt.js","chunk-dep2-tTS3nOMy.js"])
console.log('referenced asset in renderChunk', 'asset-test-uF-4QoZ1');
