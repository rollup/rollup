module.exports = {
	description: 'synthetic named exports',
	options: {
		input: ['main.js'],
		plugins: [
			{
				resolveId(id) {
					if (id === './dep1.js') {
						return id;
					}
					return null;
				},
				load(id) {
					if (id === './dep1.js') {
						return {
							code: `
const d = {
  fn: 42,
  hello: 'hola'
};
export default d;`,
							syntheticNamedExports: true
						};
					}
					return null;
				}
			}
		]
	}
};
