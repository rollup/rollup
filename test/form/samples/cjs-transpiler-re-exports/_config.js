const { execSync } = require('node:child_process');

module.exports = defineTest({
	description:
		'Compatibility with CJS Transpiler Re-exports if output.externalLiveBindings is false',
	formats: ['cjs'],
	options: {
		output: {
			externalLiveBindings: false
		},
		plugins: [
			{
				resolveId(id) {
					if (id.endsWith('main.js')) {
						return { id };
					}
					return {
						id,
						external: true
					};
				},
				buildEnd() {
					this.emitFile({
						type: 'prebuilt-chunk',
						fileName: 'foo.js',
						code:
							'exports.foo = 1;\n' +
							'Object.defineProperty(exports, "__proto__", {\n' +
							'	enumerable: true,\n' +
							'	value: 2\n' +
							'});'
					});
					this.emitFile({
						type: 'prebuilt-chunk',
						fileName: 'execute.mjs',
						code:
							'import assert from "node:assert";\n' +
							'import { foo, __proto__ } from "./cjs.js";\n' +
							'assert.strictEqual(foo, 1);\n' +
							'assert.strictEqual(__proto__, 2);'
					});
				}
			}
		]
	},
	after() {
		execSync('node _actual/execute.mjs', { cwd: __dirname });
	}
});
