import * as external from 'external';
import foo from './foo.js'
export { quux as strange } from './quux.js';

function bar () {
	return foo;
}

export function baz () {
	return 13 + external.value;
}
