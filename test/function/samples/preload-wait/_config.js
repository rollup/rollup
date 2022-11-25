const assert = require('node:assert');
const path = require('node:path');
let otherLoaded = false;

module.exports = {
	description: 'waits for pre-loaded modules before ending build phase',
	options: {
		plugins: [
			{
				name: 'test',
				buildEnd() {
					assert.ok(otherLoaded);
				},
				moduleParsed({ id }) {
					if (id.endsWith('main.js')) {
						this.load({ id: path.join(__dirname, 'other.js') });
					} else {
						otherLoaded = true;
					}
				}
			}
		]
	}
};
