import depA from './dep-a';
import depB from './dep-b';
import depC from './dep-c';
import depD from './dep-d';
import depTest from './dep.test';

assert.equal(depA, '.js');
assert.equal(depB, 'no-file-extension');
assert.equal(depC, '.mjs');
assert.equal(depD, '.foo');
assert.equal(depTest, '.test.js');
