import { foo } from './reexporter-chain-2.js';
foo.chain1 = 'should not be modified';
export { foo } from './reexporter-chain-2.js';
