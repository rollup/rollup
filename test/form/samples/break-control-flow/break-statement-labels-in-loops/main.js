while (globalThis.unknown) {
	console.log('retained');
	label: {
		break;
		console.log('removed');
	}
	console.log('removed');
}

{
	while (globalThis.unknown) {
		label: {
			break;
			console.log('removed');
		}
		console.log('removed');
	}
	console.log('retained');
}

while (globalThis.unknown) {
	label: {
		break label;
		console.log('removed');
	}
	console.log('retained');
}

label: {
	while (globalThis.unknown) {
		console.log('retained');
		break label;
		console.log('removed');
	}
	console.log('retained');
}

while (globalThis.unknown) {
	console.log('retained');
	outer: {
		label: {
			break outer;
			console.log('removed');
		}
		console.log('removed');
	}
	console.log('retained');
}

