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

{
	console.log('retained');
}

function returnNoDefault() {
	switch (globalThis.unknown) {
		case 1:
			return;

		case 2:
			return;

	}
	console.log('retained');
}

returnNoDefault();

function returnSomeBreak() {
	switch (globalThis.unknown) {
		case 1:
			return;

		case 2:
			break;

		default:
			return;

	}
	console.log('retained');
}

returnSomeBreak();

function allBreak() {
	console.log('retained');
}

allBreak();

function returnBreakDifferentLabels() {
	outer: {
		inner: {
			switch (globalThis.unknown) {
				case 1:
					break outer;

				case 2:
					break inner;

				default:
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
