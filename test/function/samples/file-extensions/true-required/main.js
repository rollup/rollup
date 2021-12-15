import depJs from './dep.js';
import depMjs from './dep.mjs';
import depExtensionLess from './dep';

assert.equal(depJs, '.js');
assert.equal(depMjs, '.mjs');
assert.equal(depExtensionLess, 'no-file-extension');
