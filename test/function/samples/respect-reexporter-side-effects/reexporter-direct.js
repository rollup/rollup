import { foo } from './foo.js';
foo.direct = 'should not be modified';
export { foo } from './foo.js';
