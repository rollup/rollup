while (globalThis.unknown) {
	console.log('retained');
	label: {
		break;
	}
}

{
	console.log('retained');
}

while (globalThis.unknown) {
	label: {
		break label;
	}
	console.log('retained');
}

label: {
	while (globalThis.unknown) {
		console.log('retained');
		break label;
	}
	console.log('retained');
}

while (globalThis.unknown) {
	console.log('retained');
	outer: {
		label: {
			break outer;
		}
	}
	console.log('retained');
}
