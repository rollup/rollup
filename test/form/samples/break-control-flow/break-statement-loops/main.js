while (globalThis.unknown) {
	console.log('retained');
	break;
	continue;
	console.log('removed');
}

while (globalThis.unknown) {
	console.log('retained');
	continue;
	break;
	console.log('removed');
}

do {
	console.log('retained');
	break;
	console.log('removed');
} while (globalThis.unknown);

for (let i = 0; i < globalThis.unknown; i++) {
	console.log('retained');
	break;
	console.log('removed');
}

for (const foo of globalThis.unknown) {
	console.log('retained');
	break;
	console.log('removed');
}

for (const foo in globalThis.unknown) {
	console.log('retained');
	break;
	console.log('removed');
}
