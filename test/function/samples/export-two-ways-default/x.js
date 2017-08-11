export { default as X } from './foo.js';
import { X } from './foo.js';

export function x () {
	return new X();
}
