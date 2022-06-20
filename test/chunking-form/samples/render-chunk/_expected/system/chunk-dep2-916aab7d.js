System.register([], (function (exports, module) {
	'use strict';
	return {
		execute: (function () {

			var num = exports('n', 2);
			console.log('referenced asset', new URL('asset-test-31f014b5', module.meta.url).href);

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
  "fileName": "chunk-dep2-916aab7d.js",
  "implicitlyLoadedBefore": [],
  "importedBindings": {},
  "imports": [],
  "modules": {
    "**/dep2.js": {
      "code": "\t\t\tvar num = exports('n', 2);\n\t\t\tconsole.log('referenced asset', new URL('asset-test-31f014b5', module.meta.url).href);",
      "originalLength": 19,
      "removedExports": [],
      "renderedExports": [
        "num"
      ],
      "renderedLength": 113
    }
  },
  "referencedFiles": [
    "asset-test-31f014b5"
  ]
});
console.log('all chunks', ["entry-main1-d5a6a5a0.js","chunk-dep2-916aab7d.js","entry-main2-5d67a108.js"])
console.log('referenced asset in renderChunk', 'asset-test-31f014b5');
