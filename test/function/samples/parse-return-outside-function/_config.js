const assert = require('node:assert');
const { compareError } = require('../../../testHelpers');

module.exports = defineTest({
	description: 'supports parsing return statements outside functions via options',
	options: {
		plugins: [
			{
				name: 'test',
				buildStart() {
					assert.deepStrictEqual(
						this.parse('return foo', {
							allowReturnOutsideFunction: true
						}),
						{
							type: 'Program',
							start: 0,
							end: 10,
							body: [
								{
									type: 'ReturnStatement',
									start: 0,
									end: 10,
									argument: { type: 'Identifier', start: 7, end: 10, name: 'foo' }
								}
							],
							sourceType: 'module'
						}
					);
					let expectedError = null;
					try {
						this.parse('return foo', {
							allowReturnOutsideFunction: false
						});
					} catch (error) {
						expectedError = error;
					}
					compareError(expectedError, {
						code: 'PARSE_ERROR',
						message: 'Return statement is not allowed here',
						pos: 0
					});
					expectedError = null;
					try {
						this.parse('return foo');
					} catch (error) {
						expectedError = error;
					}
					compareError(expectedError, {
						code: 'PARSE_ERROR',
						message: 'Return statement is not allowed here',
						pos: 0
					});
				}
			}
		]
	}
});
