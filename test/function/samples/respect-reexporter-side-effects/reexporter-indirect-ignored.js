import { foo } from './foo.js';
foo.indirectIgnored = 'should not be modified';
export { foo };
