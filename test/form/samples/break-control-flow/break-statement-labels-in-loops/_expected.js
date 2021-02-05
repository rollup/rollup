while (globalThis.unknown) {
	console.log('retained');
	{
		break;
	}
}

{
	console.log('retained');
}

while (globalThis.unknown) {
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
	console.log('retained');
}
