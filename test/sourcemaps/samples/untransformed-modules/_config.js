const assert = require('assert');
const MagicString = require('magic-string');

module.exports = {
	description: 'allows sourcemap chains with some untransformed modules (#404)',
	options: {
		plugins: [
			{
				transform(code, id) {
					if (/untransformed-modules\/foo/.test(id)) {
						const s = new MagicString(code);
						const index = code.indexOf('1');
						s.overwrite(index, index + 1, '2');

						return {
							code: s.toString(),
							map: s.generateMap({ hires: true })
						};
					}
				}
			}
		]
	},
	test() {
		assert.ok(true);
	}
};
