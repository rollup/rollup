import { fooPrefix } from './foo-prefix.js';

const { foo } = await import('./foo.js');

export function getFoo() {
	return unknownFlag ? foo : fooPrefix;
}
