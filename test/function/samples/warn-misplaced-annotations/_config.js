const { join } = require('node:path');
const ID_MAIN = join(__dirname, 'main.js');

module.exports = defineTest({
	description: 'warns for misplaced annotations',
	warnings: [
		{
			code: 'INVALID_ANNOTATION',
			id: ID_MAIN,
			message:
				'A comment\n\n"/*@__NO_SIDE_EFFECTS__*/"\n\nin "main.js" contains an annotation that Rollup cannot interpret due to the position of the comment. The comment will be removed to avoid issues.',
			url: 'https://rollupjs.org/configuration-options/#no-side-effects',
			pos: 45,
			loc: {
				column: 0,
				file: ID_MAIN,
				line: 2
			},
			frame: `
				1: /*@__PURE__*/ const x = () => console.log();
				2: /*@__NO_SIDE_EFFECTS__*/ const foo = 1,
				   ^
				3:   bar = () => console.log();
				4: /*@__NO_SIDE_EFFECTS__*/ assert.ok(true);`
		},
		{
			code: 'INVALID_ANNOTATION',
			id: ID_MAIN,
			message:
				'A comment\n\n"/*@__NO_SIDE_EFFECTS__*/"\n\nin "main.js" contains an annotation that Rollup cannot interpret due to the position of the comment. The comment will be removed to avoid issues.',
			url: 'https://rollupjs.org/configuration-options/#no-side-effects',
			pos: 113,
			loc: {
				column: 0,
				file: ID_MAIN,
				line: 4
			},
			frame: `
				2: /*@__NO_SIDE_EFFECTS__*/ const foo = 1,
				3:   bar = () => console.log();
				4: /*@__NO_SIDE_EFFECTS__*/ assert.ok(true);
				   ^`
		},
		{
			code: 'INVALID_ANNOTATION',
			id: ID_MAIN,
			message:
				'A comment\n\n"/*@__PURE__*/"\n\nin "main.js" contains an annotation that Rollup cannot interpret due to the position of the comment. The comment will be removed to avoid issues.',
			url: 'https://rollupjs.org/configuration-options/#pure',
			pos: 0,
			loc: {
				column: 0,
				file: ID_MAIN,
				line: 1
			},
			frame: `
				1: /*@__PURE__*/ const x = () => console.log();
				   ^
				2: /*@__NO_SIDE_EFFECTS__*/ const foo = 1,
				3:   bar = () => console.log();`
		}
	]
});
