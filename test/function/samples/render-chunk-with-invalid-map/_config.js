module.exports = defineTest({
	description: 'treats an invalid string map from a renderChunk hook as missing',
	options: {
		plugins: [
			{
				name: 'invalid render chunk map plugin',
				renderChunk(code) {
					return { code, map: 'undefined' };
				}
			}
		],
		output: { sourcemap: true }
	},
	warnings: [
		{
			code: 'SOURCEMAP_BROKEN',
			message: `[plugin invalid render chunk map plugin] Sourcemap is likely to be incorrect: a plugin (invalid render chunk map plugin) was used to transform files, but didn't generate a sourcemap for the transformation. Consult the plugin documentation for help`,
			plugin: 'invalid render chunk map plugin',
			url: 'https://rollupjs.org/troubleshooting/#warning-sourcemap-is-likely-to-be-incorrect'
		}
	]
});
