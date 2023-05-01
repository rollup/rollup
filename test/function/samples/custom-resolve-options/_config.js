const assert = require('node:assert');
const path = require('node:path');

module.exports = defineTest({
	description: 'supports custom resolve options',
	options: {
		plugins: [
			{
				name: 'first-plugin',
				async transform() {
					const [{ id: first }, { id: second }] = await Promise.all([
						this.resolve('./main.js'),
						this.resolve('./main.js', undefined, {
							custom: { second: { actualId: 'the-actual-id' } }
						})
					]);
					return `export const first = ${JSON.stringify(first)};
					export const second = ${JSON.stringify(second)};`;
				}
			},
			{
				name: 'second-plugin',
				resolveId(source, importer, { custom }) {
					if (custom && custom.second) {
						return custom.second.actualId;
					}
				}
			}
		]
	},
	exports(exports) {
		assert.deepStrictEqual(exports, {
			first: path.join(__dirname, 'main.js'),
			second: 'the-actual-id'
		});
	}
});
