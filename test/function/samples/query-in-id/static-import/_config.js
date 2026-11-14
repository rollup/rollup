const assert = require('node:assert/strict');

// Baseline/control: when the same "?"-containing id flows through the regular
// static-import resolution path, it is correctly treated as an opaque id. This
// documents the inconsistency with the this.load and this.resolve paths above:
// the "?" is only misinterpreted as attributes when an id is passed in as a
// plain string via the plugin context.
const VIRTUAL_ID = '\0virtual:asset?width=100&height=200';

module.exports = defineTest({
	description: 'treats a "?" query in a resolved id as an opaque id on the static-import path',
	options: {
		plugins: [
			{
				name: 'test',
				resolveId(source) {
					if (source === 'virtual') return VIRTUAL_ID;
				},
				load(id) {
					if (id === VIRTUAL_ID) return 'export const v = 1';
				},
				buildEnd() {
					const info = this.getModuleInfo(VIRTUAL_ID);
					assert.ok(info, `module "${VIRTUAL_ID}" should exist`);
					assert.equal(
						info.id,
						VIRTUAL_ID,
						`info.id should be "${VIRTUAL_ID}" but got "${info.id}"`
					);
					assert.equal(
						info.rawId,
						VIRTUAL_ID,
						`info.rawId should be "${VIRTUAL_ID}" but got "${info.rawId}"`
					);
					assert.deepEqual(
						info.attributes,
						{},
						`info.attributes should be empty but got ${JSON.stringify(info.attributes)}`
					);
				}
			}
		]
	}
});
