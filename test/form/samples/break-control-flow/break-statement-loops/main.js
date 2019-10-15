while (globalThis.unknown) {
	console.log('retained');
	break;
	continue;
	console.log('removed');
}

{
	while (globalThis.unknown) {
		break;
		continue;
		console.log('removed');
	}
	console.log('retained');
}

while (globalThis.unknown) {
	console.log('retained');
	continue;
	break;
	console.log('removed');
}

{
	while (globalThis.unknown) {
		continue;
		break;
		console.log('removed');
	}
	console.log('retained');
}

do {
	console.log('retained');
	break;
	console.log('removed');
} while (globalThis.unknown);

{
	do {
		break;
		console.log('removed');
	} while (globalThis.unknown);
	console.log('retained');
}

for (let i = 0; i < globalThis.unknown; i++) {
	console.log('retained');
	break;
	console.log('removed');
}

{
	for (let i = 0; i < globalThis.unknown; i++) {
		break;
		console.log('removed');
	}
	console.log('retained');
}

for (const foo of globalThis.unknown) {
	console.log('retained');
	break;
	console.log('removed');
}

{
	for (const foo of globalThis.unknown) {
		break;
		console.log('removed');
	}
	console.log('retained');
}

for (const foo in globalThis.unknown) {
	console.log('retained');
	break;
	console.log('removed');
}

{
	for (const foo in globalThis.unknown) {
		break;
		console.log('removed');
	}
	console.log('retained');
}
