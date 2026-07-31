module.exports = defineTest({
	description:
		'does not warn about ambiguous globals when the import attribute variants of an external module are only imported for side effects',
	options: {
		plugins: [
			{
				name: 'resolver',
				resolveId(source) {
					if (source === './logo.png') {
						return { external: true, id: source };
					}
				}
			}
		],
		output: {
			format: 'iife',
			globals: {
				'./logo.png': 'theGlobal'
			}
		}
	}
});
