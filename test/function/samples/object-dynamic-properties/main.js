import tags from './tags';

assert.equal(tags['[object Object]'], true);
assert.equal(tags['[object Number]'], false);
assert.equal(Object.keys(tags).length, 6);
