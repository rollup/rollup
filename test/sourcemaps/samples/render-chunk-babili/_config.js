const assert = require('node:assert');
const { SourceMapConsumer } = require('source-map');
const getLocation = require('../../getLocation');

const babiliResults = {
	amd: {
		code: "define(function(){'use strict';console.log(42)});",
		map: {
			version: 3,
			sources: ['unknown'],
			names: ['define', 'console', 'log'],
			mappings: 'AAAAA,OAAO,UAAY,CAAE,aAErBC,QAAQC,GAAR,CAAa,EAAb,CAEC,CAJD,C',
			file: 'unknown',
			sourcesContent: ["define(function () { 'use strict';\n\nconsole.log( 42 );\n\n});"]
		}
	},
	cjs: {
		code: "'use strict';console.log(42);",
		map: {
			version: 3,
			sources: ['unknown'],
			names: ['console', 'log'],
			mappings: 'AAAA,aAEAA,QAAQC,GAAR,CAAa,EAAb,C',
			file: 'unknown',
			sourcesContent: ["'use strict';\n\nconsole.log( 42 );"]
		}
	},
	es: {
		code: 'console.log(42);',
		map: {
			version: 3,
			sources: ['unknown'],
			names: ['console', 'log'],
			mappings: 'AAAAA,QAAQC,GAAR,CAAa,EAAb,C',
			file: 'unknown',
			sourcesContent: ['console.log( 42 );']
		}
	},
	iife: {
		code: "(function(){'use strict';console.log(42)})();",
		map: {
			version: 3,
			sources: ['unknown'],
			names: ['console', 'log'],
			mappings: 'AAAC,WAAY,CACb,aAEAA,QAAQC,GAAR,CAAa,EAAb,CAEC,CALA,G',
			file: 'unknown',
			sourcesContent: ["(function () {\n'use strict';\n\nconsole.log( 42 );\n\n}());"]
		}
	},
	umd: {
		code: "(function(a){'function'==typeof define&&define.amd?define(a):a()})(function(){'use strict';console.log(42)});",
		map: {
			version: 3,
			sources: ['unknown'],
			names: ['define', 'amd', 'console', 'log'],
			mappings:
				'AAAC,YAAmB,CACF,UAAlB,QAAOA,OAAP,EAAgCA,OAAOC,GAAvC,CAA6CD,SAA7C,CACA,GACC,CAHA,EAGC,UAAY,CAAE,aAEhBE,QAAQC,GAAR,CAAa,EAAb,CAEC,CAPA,C',
			file: 'main.js',
			sourcesContent: [
				"(function (factory) {\ntypeof define === 'function' && define.amd ? define(factory) :\nfactory();\n}(function () { 'use strict';\n\nconsole.log( 42 );\n\n}));\n"
			]
		}
	}
};

module.exports = defineTest({
	description: 'generates valid sourcemap when source could not be determined',
	options: {
		plugins: [
			{
				name: 'test-plugin',
				renderChunk(code, chunk, options) {
					const format = options.format;

					return babiliResults[format];
				}
			}
		],
		output: { indent: false }
	},
	async test(code, map) {
		const smc = await new SourceMapConsumer(map);

		let generatedLoc = getLocation(code, code.indexOf('42'));
		let originalLoc = smc.originalPositionFor(generatedLoc);

		assert.ok(/main/.test(originalLoc.source));
		assert.equal(originalLoc.line, 1);
		assert.equal(originalLoc.column, 13);

		generatedLoc = getLocation(code, code.indexOf('log'));
		originalLoc = smc.originalPositionFor(generatedLoc);

		assert.equal(originalLoc.line, 1);
		assert.equal(originalLoc.column, 8);
	}
});
