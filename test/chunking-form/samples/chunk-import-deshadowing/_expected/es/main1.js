import { e as emptyFunction } from './generated-lib.js';

function fn() {
	var emptyFunction$1 = emptyFunction;
	console.log(emptyFunction$1);
}

console.log('dep1');

fn();
