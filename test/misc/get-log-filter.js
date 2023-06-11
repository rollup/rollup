const assert = require('node:assert/strict');
const { getLogFilter } = require('../../dist/getLogFilter');

describe('getLogFilter', () => {
	it('does not filter when there are no filters', () => {
		const filter = getLogFilter([]);
		assert.equal(filter({ code: 'FIRST' }), true);
	});

	it('filters for string matches', () => {
		const filter = getLogFilter(['code:FIRST']);
		assert.equal(filter({ code: 'FIRST' }), true);
		assert.equal(filter({ code: 'SECOND' }), false);
		assert.equal(filter({ message: 'no code' }), false);
	});

	it('combines multiple filters with "or"', () => {
		const filter = getLogFilter(['code:FIRST', 'message:second']);
		assert.equal(filter({ code: 'FIRST', message: 'first' }), true);
		assert.equal(filter({ code: 'SECOND', message: 'first' }), false);
		assert.equal(filter({ code: 'FIRST', message: 'second' }), true);
		assert.equal(filter({ code: 'SECOND', message: 'second' }), true);
	});

	it('supports placeholders', () => {
		const filter = getLogFilter(['code:*A', 'code:B*', 'code:*C*', 'code:D*E*F']);
		assert.equal(filter({ code: 'xxA' }), true, 'xxA');
		assert.equal(filter({ code: 'xxB' }), false, 'xxB');
		assert.equal(filter({ code: 'Axx' }), false, 'Axx');
		assert.equal(filter({ code: 'Bxx' }), true, 'Bxx');
		assert.equal(filter({ code: 'C' }), true, 'C');
		assert.equal(filter({ code: 'xxCxx' }), true, 'xxCxx');
		assert.equal(filter({ code: 'DxxExxF' }), true, 'DxxExxF');
	});

	// TODO Lukas handle edge cases: non-string-values (number, object), empty string, no colon, extra colon on right side, & condition
});
