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
