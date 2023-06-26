const assert = require('node:assert');
const { getLogFilter } = require('../../dist/getLogFilter');

describe('getLogFilter', () => {
	it('does not filter when there are no filters', () => {
		const filter = getLogFilter([]);
		assert.strictEqual(filter({ code: 'FIRST' }), true);
	});

	it('filters for string matches', () => {
		const filter = getLogFilter(['code:FIRST']);
		assert.strictEqual(filter({ code: 'FIRST' }), true);
		assert.strictEqual(filter({ code: 'SECOND' }), false);
		assert.strictEqual(filter({ message: 'no code' }), false);
	});

	it('combines multiple filters with "or"', () => {
		const filter = getLogFilter(['code:FIRST', 'message:second']);
		assert.strictEqual(filter({ code: 'FIRST', message: 'first' }), true);
		assert.strictEqual(filter({ code: 'SECOND', message: 'first' }), false);
		assert.strictEqual(filter({ code: 'FIRST', message: 'second' }), true);
		assert.strictEqual(filter({ code: 'SECOND', message: 'second' }), true);
	});

	it('supports placeholders', () => {
		const filter = getLogFilter(['code:*A', 'code:B*', 'code:*C*', 'code:D*E*F']);
		assert.strictEqual(filter({ code: 'xxA' }), true, 'xxA');
		assert.strictEqual(filter({ code: 'xxB' }), false, 'xxB');
		assert.strictEqual(filter({ code: 'Axx' }), false, 'Axx');
		assert.strictEqual(filter({ code: 'Bxx' }), true, 'Bxx');
		assert.strictEqual(filter({ code: 'C' }), true, 'C');
		assert.strictEqual(filter({ code: 'xxCxx' }), true, 'xxCxx');
		assert.strictEqual(filter({ code: 'DxxExxF' }), true, 'DxxExxF');
	});

	it('supports inverted filters', () => {
		const filter = getLogFilter(['!code:FIRST']);
		assert.strictEqual(filter({ code: 'FIRST' }), false);
		assert.strictEqual(filter({ code: 'SECOND' }), true);
	});

	it('supports AND conditions', () => {
		const filter = getLogFilter(['code:FIRST&plugin:my-plugin']);
		assert.strictEqual(filter({ code: 'FIRST', plugin: 'my-plugin' }), true);
		assert.strictEqual(filter({ code: 'FIRST', plugin: 'other-plugin' }), false);
		assert.strictEqual(filter({ code: 'SECOND', plugin: 'my-plugin' }), false);
	});

	it('handles numbers and objects', () => {
		const filter = getLogFilter(['foo:1', 'bar:*2*', 'baz:{"a":1}', 'baz:{"b":1,*}']);
		assert.strictEqual(filter({ foo: 1 }), true, 'foo:1');
		assert.strictEqual(filter({ foo: 10 }), false, 'foo:10');
		assert.strictEqual(filter({ bar: 123 }), true, 'bar:123');
		assert.strictEqual(filter({ bar: 13 }), false, 'bar:13');
		assert.strictEqual(filter({ baz: { a: 1 } }), true, 'baz:{"a":1}');
		assert.strictEqual(filter({ baz: { a: 1, b: 2 } }), false, 'baz:{"a":1,"b":2}');
		assert.strictEqual(filter({ baz: { b: 1, c: 2 } }), true, 'baz:{"b":1,"c":2}');
	});

	it('handles edge case filters', () => {
		const filter = getLogFilter([
			':A', // property is "empty string"
			'a:', // value is "empty string"
			'', // property and value are "empty string"
			'code:A&', // property and value are "empty string",
			'foo:bar:baz' // second colon is treated literally
		]);
		assert.strictEqual(filter({ '': 'A' }), true, ':A');
		assert.strictEqual(filter({ foo: 'A' }), false, 'foo:A');
		assert.strictEqual(filter({ a: '' }), true, 'a:');
		assert.strictEqual(filter({ a: 'foo' }), false, 'a:foo');
		assert.strictEqual(filter({ '': '' }), true, '');
		assert.strictEqual(filter({ code: 'A' }), false, 'code:A');
		assert.strictEqual(filter({ code: 'A', '': '' }), true, 'code:A&');
		assert.strictEqual(filter({ foo: 'bar:baz' }), true, 'foo:bar:baz');
	});

	it('handles nested properties', () => {
		const filter = getLogFilter(['foo.bar:baz']);
		assert.strictEqual(filter({ foo: null }), false, 'foo:bar');
		assert.strictEqual(filter({ foo: { bar: 'baz' } }), true, 'foo.bar:baz');
		assert.strictEqual(filter({ foo: { bar: 'qux' } }), false, 'foo.bar:qux');
		assert.strictEqual(filter({ foo: { bar: { baz: 'qux' } } }), false, 'foo.bar.baz:qux');
	});
});
