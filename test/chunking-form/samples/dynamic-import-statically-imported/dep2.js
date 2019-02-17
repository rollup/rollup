export function foo() {
	return 'dep2';
}

import('./dep1.js').then(({ bar }) => console.log(bar()));
