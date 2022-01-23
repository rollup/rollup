const assert = require('assert');
const path = require('path');
const ID_MAIN = path.join(__dirname, 'main.js');

let initialMeta;

module.exports = {
	description: 'allows to freely modify moduleInfo.meta and maintain object identity',
	options: {
		plugins: [
			{
				name: 'first',
				buildStart() {
					this.load({ id: ID_MAIN });
					initialMeta = this.getModuleInfo(ID_MAIN).meta;
					initialMeta.buildStart = true;
				},
				load(id) {
					assert.strictEqual(id, ID_MAIN);
					const meta = this.getModuleInfo(ID_MAIN).meta;
					assert.deepStrictEqual(meta, { buildStart: true }, 'load');
					assert.strictEqual(meta, initialMeta);
					meta.load1a = true;
					return { code: `assert.ok(true);`, meta: { load1b: true } };
				},
				transform(code, id) {
					assert.strictEqual(id, ID_MAIN);
					const meta = this.getModuleInfo(ID_MAIN).meta;
					assert.deepStrictEqual(
						meta,
						{ buildStart: true, load1a: true, load1b: true },
						'transform'
					);
					assert.strictEqual(meta, initialMeta);
					meta.transform1a = true;
					return { code: `assert.ok(true);`, meta: { transform1b: true } };
				},
				buildEnd(error) {
					if (error) {
						throw error;
					}
					const meta = this.getModuleInfo(ID_MAIN).meta;
					assert.deepStrictEqual(
						meta,
						{
							buildStart: true,
							load1a: true,
							load1b: true,
							transform1a: true,
							transform1b: true,
							transform2: true
						},
						'buildEnd'
					);
				}
			},
			{
				name: 'second',
				transform(code, id) {
					assert.strictEqual(id, ID_MAIN);
					return { code: `assert.ok(true);`, meta: { transform2: true } };
				}
			}
		]
	}
};
