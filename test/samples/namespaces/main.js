import * as foo from './foo';

assert.equal(foo['default'], 'DEF');
assert.equal(foo.b, 'b');
assert.equal(foo.a, 'a');

var keys = [];
for (var key in foo) {
  keys.push(key);
}
assert.deepEqual(keys.sort(), ['a', 'b', 'default']);
