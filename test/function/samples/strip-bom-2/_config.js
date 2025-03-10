const fs = require('node:fs');
const assert = require('node:assert');

module.exports = defineTest({
	description: 'Works correctly with multi BOMs files.',
	options: {
		plugins: [
			{
				load(id) {
					const content = fs.readFileSync(id, 'utf8');
					assert.ok(content.charCodeAt(0) === 0xfe_ff);
					assert.ok(content.charCodeAt(1) === 0xfe_ff);
					return content;
				}
			}
		]
	}
});
