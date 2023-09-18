const path = require('node:path');
const ID_MAIN = path.join(__dirname, 'main.js');
const ID_PROXY = path.join(__dirname, 'main.js?proxy');

module.exports = defineTest({
	description: 'handles pre-loading a cyclic module in the resolveId hook',
	warnings: [
		{
			code: 'CIRCULAR_DEPENDENCY',
			ids: [ID_MAIN, ID_PROXY, ID_MAIN],
			message: 'Circular dependency: main.js -> main.js?proxy -> main.js'
		}
	],
	options: {
		plugins: [
			{
				async resolveId(source, importer, options) {
					if (!importer || importer.endsWith('?proxy')) {
						return null;
					}
					const resolution = await this.resolve(source, importer, options);
					if (resolution && !resolution.external) {
						const moduleInfo = await this.load(resolution);
						if (moduleInfo.code.includes('/* use proxy */')) {
							return `${resolution.id}?proxy`;
						}
					}
					return resolution;
				},
				load(id) {
					if (id.endsWith('?proxy')) {
						const importee = id.slice(0, -'?proxy'.length);
						return `export * from ${JSON.stringify(importee)}; export const extra = 'extra';`;
					}
					return null;
				}
			}
		]
	}
});
