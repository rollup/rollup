import { foo as fooIndirect } from './reexporter-indirect.js';
import { foo as fooDirect } from './reexporter-direct';
import { foo as fooIndirectIgnored } from './reexporter-indirect-ignored';

assert.deepStrictEqual(fooIndirect, { indirect: 'modified' });
assert.deepStrictEqual(fooDirect, { indirect: 'modified' });
