function errorTry() {
	try {
		throw new Error('Break');
	} catch {
		console.log('retained');
	} finally {
		console.log('retained');
	}

	console.log('retained');
}

try {
	errorTry();
} catch {}

function errorCatch() {
	try {
		console.log('retained');
	} catch {
		throw new Error('Break');
	} finally {
		console.log('retained');
	}

	console.log('retained');
}

try {
	errorCatch();
} catch {}

function errorFinally() {
	try {
		console.log('retained');
	} catch {
		console.log('retained');
	} finally {
		throw new Error('Break');
	}
}

try {
	errorFinally();
} catch {}

function tryAfterError() {
	console.log(hoisted1, hoisted2, hoisted3);
	throw new Error();
	try {
		var hoisted1;
	} catch {
		var hoisted2;
	} finally {
		var hoisted3;
	}
}

try {
	tryAfterError();
} catch {}
