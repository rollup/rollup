const assert = require('node:assert/strict');

// A plugin-provided id that contains a "?" for reasons unrelated to import
// attributes, e.g. a Vite-style query suffix on a virtual module.
const VIRTUAL_ID = '\0virtual:asset?width=100&height=200';

module.exports = defineTest({
	description:
		'does not misinterpret a "?" query in a plugin id as import attributes when preloading via this.load',
	options: {
		plugins: [
			{
				name: 'test',
				load(id, { rawId, attributes }) {
					if (id === VIRTUAL_ID) {
						// The "load" hook must receive the full id as rawId and no
						// attributes, since the "?" is part of the id, not an attribute.
						assert.equal(
							rawId,
							VIRTUAL_ID,
							`load hook rawId should be "${VIRTUAL_ID}" but got "${rawId}"`
						);
						assert.deepEqual(
							attributes,
							{},
							`load hook attributes should be empty but got ${JSON.stringify(attributes)}`
						);
						return 'export const v = 1';
					}
				},
				async buildEnd() {
					const info = await this.load({ id: VIRTUAL_ID });
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
