import depA from './dep-a';
import depB from './dep-b';
import depC from './dep-c';

assert.equal(depA, 'no-file-extension');
assert.equal(depB, '.mjs');
assert.equal(depC, '.js');
