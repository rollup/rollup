const assert = require('assert');
const path = require('path');
const meta = { plugin: { initial: true } };

const ID_MAIN = path.join(__dirname, 'main.js');

module.exports = {
	description: 'does not modify meta objects passed in resolveId',
	options: {
		plugins: [
			{
				async resolveId(source, importer) {
					const { id } = await this.resolve(source, importer, { skipSelf: true });
					return { id, meta };
				},
				transform(code) {
					return { code, meta: { otherPlugin: { ignored: true }, plugin: { replaced: true } } };
				},
				buildEnd() {
					assert.deepStrictEqual(meta, { plugin: { initial: true } });
					assert.deepStrictEqual(this.getModuleInfo(ID_MAIN).meta, {
						otherPlugin: { ignored: true },
						plugin: { replaced: true }
					});
				}
			}
		]
	}
};
