import * as foo from 'external';
assert.deepStrictEqual(foo, { __proto__: null, default: { external: true } });
