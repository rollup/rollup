const assert = require('node:assert/strict');
const path = require('node:path');

const ID_MAIN = path.join(__dirname, 'main.js');
const ID_MAIN_WITH_ATTRIBUTES = `${ID_MAIN}?attributes=${encodeURIComponent('{"type":"custom"}')}`;

module.exports = defineTest({
	description:
		'throws when the attributes passed to this.load conflict with the attributes of the id',
	options: {
		plugins: [
			{
				name: 'test',
				async buildStart() {
					await assert.rejects(
						this.load({ attributes: { type: 'other' }, id: ID_MAIN_WITH_ATTRIBUTES }),
						{
							code: 'CONFLICTING_MODULE_ATTRIBUTES',
							message:
								'Cannot use the import attributes {"type":"other"} for "main.js" as its module id already encodes the import attributes {"type":"custom"}.'
						}
					);
					await assert.rejects(this.load({ attributes: {}, id: ID_MAIN_WITH_ATTRIBUTES }), {
						code: 'CONFLICTING_MODULE_ATTRIBUTES',
						message:
							'Cannot use the import attributes {} for "main.js" as its module id already encodes the import attributes {"type":"custom"}.'
					});
					await assert.rejects(
						this.load({
							attributes: { type: 'other' },
							id: { attributes: { type: 'custom' }, rawId: ID_MAIN }
						}),
						{
							code: 'CONFLICTING_MODULE_ATTRIBUTES',
							message:
								'Cannot use the import attributes {"type":"other"} for "main.js" as its module id already encodes the import attributes {"type":"custom"}.'
						}
					);
					await assert.rejects(
						this.load({ attributes: { type: 'other' }, id: { attributes: {}, rawId: ID_MAIN } }),
						{
							code: 'CONFLICTING_MODULE_ATTRIBUTES',
							message:
								'Cannot use the import attributes {"type":"other"} for "main.js" as its module id already encodes the import attributes {}.'
						}
					);
				}
			}
		]
	}
});
