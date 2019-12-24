function unknownValueConsequent() {
	if (globalThis.unknownValue) {
		throw new Error();
	} else {
		console.log('retained');
	}
	console.log('retained');
}

try {
	unknownValueConsequent();
} catch {}

function unknownValueOnlyConsequent() {
	if (globalThis.unknownValue) {
		throw new Error();
	}
	console.log('retained');
}

try {
	unknownValueOnlyConsequent();
} catch {}

function unknownValueAlternate() {
	if (globalThis.unknownValue) {
		console.log('retained');
	} else {
		throw new Error();
	}
	console.log('retained');
}

try {
	unknownValueAlternate();
} catch {}

function unknownValueBoth() {
	if (globalThis.unknownValue) {
		throw new Error();
	} else {
		throw new Error();
	}
}

try {
	unknownValueBoth();
} catch {}

function unknownValueAfterError() {
	console.log(hoisted1, hoisted2);
	throw new Error();
	if (globalThis.unknownValue) {
		var hoisted1;
	} else {
		var hoisted2;
	}
}

try {
	unknownValueAfterError();
} catch {}

function truthyValueConsequent() {
	{
		throw new Error();
	}
}

try {
	truthyValueConsequent();
} catch {}

function truthyValueAlternate() {
	{
		console.log('retained');
	}
	console.log('retained');
}

try {
	truthyValueAlternate();
} catch {}

function falsyValueConsequent() {
	{
		console.log('retained');
	}
	console.log('retained');
}

try {
	falsyValueConsequent();
} catch {}

function falsyValueAlternate() {
	{
		throw new Error();
	}
}

try {
	falsyValueAlternate();
} catch {}
