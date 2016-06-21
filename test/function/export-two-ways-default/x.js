export { default as X } from './foo.js'; // export {X} works
import { X } from './foo.js'; // import X works

export function x () {
	return new X();
}
