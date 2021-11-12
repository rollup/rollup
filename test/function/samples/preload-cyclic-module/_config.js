module.exports = {
	description: 'handles pre-loading a cyclic module in the resolveId hook',
	warnings: [
		{
			code: 'CIRCULAR_DEPENDENCY',
			cycle: ['main.js', 'main.js?proxy', 'main.js'],
			importer: 'main.js',
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
					const resolution = await this.resolve(source, importer, { skipSelf: true, ...options });
					if (resolution && !resolution.external) {
						const moduleInfo = await this.load(resolution);
						if (moduleInfo.code.indexOf('/* use proxy */') >= 0) {
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
};
