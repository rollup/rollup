const assert = require('node:assert/strict');
const path = require('node:path');

const ID_EMITTED_WITH_ATTRIBUTES = `${path.join(__dirname, 'emitted.js')}?attributes=${encodeURIComponent('{"type":"custom"}')}`;

module.exports = defineTest({
	description: 'resolves an emitted chunk with a composite id via its raw id and attributes',
	options: {
		plugins: [
			{
				name: 'test',
				buildStart() {
					this.emitFile({ id: ID_EMITTED_WITH_ATTRIBUTES, type: 'chunk' });
					this.emitFile({
						attributes: { type: 'custom' },
						id: ID_EMITTED_WITH_ATTRIBUTES,
						type: 'chunk'
					});
					assert.throws(
						() =>
							this.emitFile({
								attributes: { type: 'other' },
								id: ID_EMITTED_WITH_ATTRIBUTES,
								type: 'chunk'
							}),
						{
							code: 'CONFLICTING_MODULE_ATTRIBUTES',
							message:
								'Cannot use the import attributes {"type":"other"} for "emitted.js" as its module id already encodes the import attributes {"type":"custom"}.'
						}
					);
				},
				buildEnd() {
					assert.equal(this.getModuleInfo(ID_EMITTED_WITH_ATTRIBUTES)?.isEntry, true);
				}
			}
		]
	}
});
