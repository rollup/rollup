import { f as fooPrefix } from './generated-foo-prefix.js';

const { foo } = await import('./generated-foo.js');

function getFoo() {
	return unknownFlag ? foo : fooPrefix;
}

console.log(getFoo());
