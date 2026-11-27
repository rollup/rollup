module.exports = defineTest({
	description: 'treats an invalid string map from a load hook as missing',
	options: {
		plugins: [
			{
				name: 'invalid load map plugin',
				load(id) {
					if (id.endsWith('main.js')) {
						return { code: 'export default 42;', map: 'undefined' };
					}
				}
			}
		],
		output: { sourcemap: true }
	}
});
