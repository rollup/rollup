function returnAll() {
	switch (globalThis.unknown) {
		case 1:
			console.log('retained');
			return;

		case 2:
			console.log('retained');
			return;

		default:
			console.log('retained');
			return;

	}
}

returnAll();

function returnNoDefault() {
	switch (globalThis.unknown) {
		case 1:
			console.log('retained');
			return;

		case 2:
			console.log('retained');
			return;

	}
	console.log('retained');
}

returnNoDefault();

function returnSomeBreak() {
	switch (globalThis.unknown) {
		case 1:
			console.log('retained');
			return;

		case 2:
			console.log('retained');
			break;

		default:
			console.log('retained');
			return;

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

				case 2:
					console.log('retained');
					break inner;

				default:
					console.log('retained');
					break outer;

			}
		}
		console.log('retained');
	}
	console.log('retained');
}

returnBreakDifferentLabels();

function empty() {
	console.log('retained');
}

empty();
