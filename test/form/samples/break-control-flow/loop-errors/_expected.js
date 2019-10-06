function whileLoop() {
	while (globalThis.unknown) {
		throw new Error();
	}
	console.log('retained');
}

try {
	whileLoop();
} catch {}

function doWhileLoop() {
	do {
		throw new Error();
	} while (globalThis.unknown);
}

try {
	doWhileLoop();
} catch {}

function forLoop() {
	for (let i = 0; i < globalThis.unknown; i++) {
		throw new Error();
	}
	console.log('retained');
}

try {
	forLoop();
} catch {}

function forOfLoop() {
	for (const foo of globalThis.unknown) {
		throw new Error();
	}
	console.log('retained');
}

try {
	forOfLoop();
} catch {}

function forInLoop() {
	for (const foo in globalThis.unknown) {
		throw new Error();
	}
	console.log('retained');
}

try {
	forInLoop();
} catch {}
