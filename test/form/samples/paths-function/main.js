import foo from 'foo';

assert.equal(foo, 42);

import('foo').then(({ default: foo }) => assert.equal(foo, 42));
