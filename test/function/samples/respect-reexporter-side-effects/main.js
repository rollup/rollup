import { foo as fooIndirect } from './reexporter-indirect.js';
import { foo as fooDirect } from './reexporter-direct';
import { foo as fooChained } from './reexporter-chain-1';
import { foo as fooIndirectIgnored } from './reexporter-indirect-ignored';

assert.deepStrictEqual(fooIndirect, { indirect: 'modified', chain2: 'modified', chain3: 'modified' });
assert.deepStrictEqual(fooDirect, { indirect: 'modified', chain2: 'modified', chain3: 'modified' });
assert.deepStrictEqual(fooChained, { indirect: 'modified', chain2: 'modified', chain3: 'modified' });
