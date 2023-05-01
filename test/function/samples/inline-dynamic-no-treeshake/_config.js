const MAGIC_ENTRY = 'main';

module.exports = defineTest({
	description: 'handles inlining dynamic imports when treeshaking is disabled for modules (#4098)',
	options: {
		input: MAGIC_ENTRY,
		output: {
			inlineDynamicImports: true
		},
		plugins: [
			{
				name: 'magic-modules',
				buildStart() {
					this.emitFile({ type: 'chunk', id: './dep.js' });
				},
				async resolveId(source) {
					if (source === MAGIC_ENTRY) {
						return { id: source, moduleSideEffects: 'no-treeshake' };
					}
					return null;
				},
				async load(id) {
					if (id !== MAGIC_ENTRY) return null;
					return `import {foo} from './reexport.js';assert.strictEqual(foo, 1);`;
				}
			}
		]
	}
});
