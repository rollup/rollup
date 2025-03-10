console.log(true);
console.log(false);
console.log(true);

function foo2() {
	console.log('has side effect');
	return false;
}
console.log(!foo2());

console.log(void 0);
console.log(typeof foo2);
console.log(-Infinity);
console.log(-180n);
console.log(-1000000100);
console.log(-1000001e3);
console.log(-0.011222);
console.log(-1222e-6);
console.log(-1e28);
console.log(-0);
console.log(Infinity);
console.log(-2);
console.log(false);

function foo3() {
	return false;
}

console.log(delete foo3.a);

switch (bar) {
	case  false:
		console.log('false');
		break;
	case  true:
		console.log('true');
		break;
	case  1:
		console.log('1');
		break;
	case  1:
		console.log('1');
		break;
	case 1:
		console.log('1');
		break;
}

async function baz(){
	await true;
}

export { baz };
