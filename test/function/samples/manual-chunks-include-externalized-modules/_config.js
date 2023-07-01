module.exports = defineTest({
	description:
		"throws for manualChunks' modules that are resolved as an external module by plugins",
	options: {
		output: {
			manualChunks: {
				rollup: ['rollup']
			}
		},
		plugins: [
			{
				resolveId(id) {
					if (id === 'rollup') {
						return {
							id,
							external: true
						};
					}
				}
			}
		]
	},
	generateError: {
		code: 'EXTERNALIZED_MODULES_CANNOT_BE_INCLUDED_IN_MANUAL_CHUNKS',
		message:
			'"rollup" cannot be included in manualChunks, because it is resolved as an external module by plugins'
	}
});
