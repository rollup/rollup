import {foo} from './dep2.js';

export function bar() {
	return foo();
}
