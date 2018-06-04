export * from './foo.js';

import { obj } from './foo.js';

export function test() {
	obj.reassigned();
}
