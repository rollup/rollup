const cleared = ['a'];
cleared.length = 0;
assert.strictEqual(cleared[0] ? 'kept' : 'cleared', 'cleared');

const truncated = [null, false, 1];
truncated.length = 1;
assert.strictEqual(truncated[2] ?? 'fallback', 'fallback');

const computed = ['a'];
computed['length'] = 0;
assert.strictEqual(computed[0] ? 'kept' : 'cleared', 'cleared');

const decremented = ['a', 'b'];
decremented.length--;
assert.strictEqual(decremented[1] ? 'kept' : 'cleared', 'cleared');

const reduced = ['a', 'b'];
reduced.length -= 1;
assert.strictEqual(reduced[1] ? 'kept' : 'cleared', 'cleared');

function clear(list) {
	list.length = 0;
}
const viaParameter = ['a'];
clear(viaParameter);
assert.strictEqual(viaParameter[0] ? 'kept' : 'cleared', 'cleared');

const nested = { list: ['a'] };
nested.list.length = 0;
assert.strictEqual(nested.list[0] ? 'kept' : 'cleared', 'cleared');
