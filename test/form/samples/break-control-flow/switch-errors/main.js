switch (globalThis.unknown) {
	case 1:
		throw new Error();
		console.log('removed');
	case 2:
		throw new Error();
		console.log('removed');
	case 3:
		console.log('retained');
	default:
		console.log('retained');
}
console.log('retained');

console.log(hoisted1, hoisted2, hoisted3);
throw new Error();
switch (globalThis.unknown) {
	case 1:
		console.log('removed');
		var hoisted1;
	case 2:
		console.log('removed');
		var hoisted2;
	case 3:
		console.log('removed');
		var hoisted3;
	default:
		console.log('removed');
}
console.log('removed');
