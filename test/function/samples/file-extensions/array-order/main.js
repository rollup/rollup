import depA from './dep-a';
import depB from './dep-b';
import depC from './dep-c';

assert.equal(depA, '.js');
assert.equal(depB, 'no-file-extension');
assert.equal(depC, '.mjs');
