function returnAll() {
	switch (globalThis.unknown) {
		case 1:
			console.log('retained');
			return;
			console.log('removed');
		case 2:
			console.log('retained');
			return;
			console.log('removed');
		default:
			console.log('retained');
			return;
			console.log('removed');
	}
	console.log('removed');
}

returnAll();

function returnNoDefault() {
	switch (globalThis.unknown) {
		case 1:
			console.log('retained');
			return;
			console.log('removed');
		case 2:
			console.log('retained');
			return;
			console.log('removed');
	}
	console.log('retained');
}

returnNoDefault();

function returnSomeBreak() {
	switch (globalThis.unknown) {
		case 1:
			console.log('retained');
			return;
			console.log('removed');
		case 2:
			console.log('retained');
			break;
			console.log('removed');
		default:
			console.log('retained');
			return;
			console.log('removed');
	}
	console.log('retained');
}

returnSomeBreak();

function returnBreakDifferentLabels() {
	outer: {
		inner: {
			switch (globalThis.unknown) {
				case 1:
					console.log('retained');
					break outer;
					console.log('removed');
				case 2:
					console.log('retained');
					break inner;
					console.log('removed');
				default:
					console.log('retained');
					break outer;
					console.log('removed');
			}
			console.log('removed');
		}
		console.log('retained');
	}
	console.log('retained');
}

returnBreakDifferentLabels();

function empty() {
	switch (globalThis.unknown) {}
	console.log('retained');
}

empty();
