const assert = require('node:assert');
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
						code: 'exports.foo = 1;'
					});
					this.emitFile({
						type: 'prebuilt-chunk',
						fileName: 'execute.mjs',
						code: 'import { foo } from "./cjs.js";'
					});
				}
			}
		]
	},
	after() {
		const result = execSync('node _expected/execute.mjs', { cwd: __dirname });
		assert.strictEqual(result.toString(), '');
	}
});
