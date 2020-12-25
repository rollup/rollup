import { foo } from './reexporter-chain-1.js';

assert.deepStrictEqual(foo, {
	chain2: 'modified',
	chain3: 'modified',
	chain4: 'modified',
	chain5: 'modified',
	chain7: 'modified',
	chain8: 'modified',
	chain10: 'modified',
	chain11: 'modified',
});
