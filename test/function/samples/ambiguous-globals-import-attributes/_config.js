module.exports = defineTest({
	description:
		'warns when the object form of "output.globals" maps several import attribute variants of the same module to one global name',
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
				'./logo.png': 'console'
			}
		}
	},
	warnings: [
		{
			code: 'AMBIGUOUS_GLOBAL_NAME',
			id: './logo.png',
			message:
				'The object form of "output.globals" maps several import attribute variants of the external module "./logo.png" to the same global name "console". Use the function form of "output.globals" to give each variant its own global name.',
			url: 'https://rollupjs.org/configuration-options/#output-globals'
		}
	]
});
