function foo() {
	// removed
	return false;
}

console.log(!foo());
console.log(!!foo());
console.log(!!!foo());

function foo2() {
	console.log('has side effect');
	return false;
}
console.log(!foo2());

console.log(void 0);
console.log(typeof foo2);
console.log(-(1 / 0));
console.log(-180n);
console.log(-1000000100);
console.log(-1000001000);
console.log(-0.011222);
console.log(-0.001222);
console.log(-1e28);
console.log(-0);
console.log(+(1 / 0));
console.log(~1);
console.log(!!!true);

function foo3() {
	return false;
}

console.log(delete foo3.a);

switch (bar) {
	case!1:
		console.log('false');
		break;
	case!0:
		console.log('true');
		break;
	case+1:
		console.log('1');
		break;
	case~-2:
		console.log('1');
		break;
	case ~-2:
		console.log('1');
		break;
}

export async function baz(){
	await!0;
}