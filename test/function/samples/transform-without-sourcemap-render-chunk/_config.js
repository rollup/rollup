module.exports = defineTest({
	description: 'preserves sourcemap chains when transforming',
	options: {
		plugins: [
			{
				name: 'fake plugin 1',
				transform(code) {
					return code;
				}
			},
			{
				name: 'fake plugin 2',
				transform(code) {
					return { code, map: null };
				},
				renderChunk(code) {
					return { code, map: null };
				}
			}
		],
		output: { sourcemap: true }
	},
	warnings: [
		{
			code: `SOURCEMAP_BROKEN`,
			plugin: 'fake plugin 1',
			message: `Sourcemap is likely to be incorrect: a plugin (fake plugin 1) was used to transform files, but didn't generate a sourcemap for the transformation. Consult the plugin documentation for help`,
			url: `https://rollupjs.org/troubleshooting/#warning-sourcemap-is-likely-to-be-incorrect`
		}
	]
});
