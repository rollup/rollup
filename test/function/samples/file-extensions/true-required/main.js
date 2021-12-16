import depJs from './dep.js';
import depMjs from './dep.mjs';
import depExtensionLess from './dep';
import depFoo from './dep.foo';
import depTestJs from './dep.test.js';

assert.equal(depJs, '.js');
assert.equal(depMjs, '.mjs');
assert.equal(depExtensionLess, 'no-file-extension');
assert.equal(depFoo, '.foo');
assert.equal(depTestJs, '.test.js');
