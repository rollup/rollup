import { baz } from './reexporter-chain-10.js';
baz.bar.foo.chain9 = 'should not be modified';
export { baz } from './reexporter-chain-10.js';