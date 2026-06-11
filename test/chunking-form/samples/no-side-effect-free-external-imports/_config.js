module.exports = defineTest({
	description:
		'does not emit side effect imports of side-effect-free externals when pure chunks are merged and hoisting is disabled (#6111)',
	options: {
		external: ['lib-main', 'lib-hooks-a', 'lib-hooks-b'],
		input: ['main.js', 'hooks.js'],
		output: {
			hoistTransitiveImports: false
		},
		preserveEntrySignatures: 'strict',
		treeshake: 'smallest'
	}
});
