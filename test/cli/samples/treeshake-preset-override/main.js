import './dep.js';

console.log('main');

({
	get foo() {
		console.log('effect');
	}
}.foo);

try {
	const noeffect = 1;
} catch {}

unknownGlobal;

let flag = true;

function test() {
	if (flag) var x = true;
	if (x) {
		return;
	}
	console.log('effect');
}

test();
flag = false;
test();