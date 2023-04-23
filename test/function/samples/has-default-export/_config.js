const assert = require('node:assert');
const path = require('node:path');

module.exports = defineTest({
	description: 'reports if a module has a default export',
	options: {
		plugins: [
			{
				async buildStart() {
					const ID_MAIN = path.join(__dirname, 'main.js');
					const loadMain = this.load({ id: ID_MAIN });
					assert.strictEqual(this.getModuleInfo(ID_MAIN).hasDefaultExport, null);
					assert.strictEqual((await loadMain).hasDefaultExport, false);

					assert.strictEqual(
						(await this.load({ id: path.join(__dirname, 'direct.js') })).hasDefaultExport,
						true,
						'direct'
					);
					assert.strictEqual(
						(await this.load({ id: path.join(__dirname, 'indirect.js') })).hasDefaultExport,
						true,
						'indirect'
					);
					assert.strictEqual(
						(await this.load({ id: path.join(__dirname, 'reexport1.js') })).hasDefaultExport,
						true,
						'reexport'
					);
					assert.strictEqual(
						(await this.load({ id: path.join(__dirname, 'reexport2.js') })).hasDefaultExport,
						true,
						'renamed reexport'
					);
				},
				load(id) {
					assert.strictEqual(this.getModuleInfo(id).hasDefaultExport, null, `load ${id}`);
				},
				transform(code, id) {
					assert.strictEqual(this.getModuleInfo(id).hasDefaultExport, null, `transform ${id}`);
				}
			}
		]
	}
});
