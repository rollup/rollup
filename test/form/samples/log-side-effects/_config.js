const path = require('node:path');
const MagicString = require('magic-string');

const ID_MAIN = path.join(__dirname, 'main.js');
const ID_MAPPED = path.join(__dirname, 'dep-mapped.js');

module.exports = defineTest({
	description: 'logs side effects',
	options: {
		experimentalLogSideEffects: true,
		plugins: [
			{
				name: 'insert-lines',
				transform(code, id) {
					if (id.endsWith('mapped.js')) {
						const magicString = new MagicString(code);
						magicString.prepend('const removed = true;\nconst alsoRemoved = true; ');
						return {
							code: magicString.toString(),
							map: magicString.generateMap({ hires: true })
						};
					}
				}
			}
		]
	},
	logs: [
		{
			level: 'info',
			code: 'FIRST_SIDE_EFFECT',
			message: `dep-mapped.js (1:0): First side effect in dep-mapped.js is at (2:26)
1: const removed = true;
2: const alsoRemoved = true; console.log('mapped effect');
                             ^`,
			id: ID_MAPPED,
			pos: 48,
			loc: {
				column: 0,
				file: ID_MAPPED,
				line: 1
			},
			frame: `
			1: console.log('mapped effect');
				   ^`
		},
		{
			level: 'info',
			code: 'FIRST_SIDE_EFFECT',
			message: `main.js (2:0): First side effect in main.js is at (2:0)
1: import './dep-mapped';
2: console.log('main effect');
   ^
3: console.log('other effect');`,
			id: ID_MAIN,
			pos: 23,
			loc: {
				column: 0,
				file: ID_MAIN,
				line: 2
			},
			frame: `
				1: import './dep-mapped';
				2: console.log('main effect');
				   ^
				3: console.log('other effect');`
		}
	]
});
