label: do {
	do {
		break;
		console.log('removed');
	} while (globalThis.unknown);
	console.log('retained');
} while (globalThis.unknown);

do {
	label: do {
		break;
		console.log('removed');
	} while (globalThis.unknown);
	console.log('retained');
} while (globalThis.unknown);

label: do {
	do {
		break label;
		console.log('removed');
	} while (globalThis.unknown);
	console.log('removed');
} while (globalThis.unknown);

label: do {
	do {
		continue;
		console.log('removed');
	} while (globalThis.unknown);
	console.log('retained');
} while (globalThis.unknown);

do {
	label: do {
		continue;
		console.log('removed');
	} while (globalThis.unknown);
	console.log('retained');
} while (globalThis.unknown);

label: do {
	do {
		continue label;
		console.log('removed');
	} while (globalThis.unknown);
	console.log('removed');
} while (globalThis.unknown);
