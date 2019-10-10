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

{
	function returnAllRemoved() {
		switch (globalThis.unknown) {
			case 1:
				return;
				console.log('removed');
			case 2:
				return;
				console.log('removed');
			default:
				return;
				console.log('removed');
		}
		console.log('removed');
	}
	console.log('retained');

	returnAllRemoved();
}

function returnNoDefault() {
	switch (globalThis.unknown) {
		case 1:
			return;
			console.log('removed');
		case 2:
			return;
			console.log('removed');
	}
	console.log('retained');
}

returnNoDefault();

function returnSomeBreak() {
	switch (globalThis.unknown) {
		case 1:
			return;
			console.log('removed');
		case 2:
			break;
			console.log('removed');
		default:
			return;
			console.log('removed');
	}
	console.log('retained');
}

returnSomeBreak();

function allBreak() {
	label: switch (globalThis.unknown) {
		case 1:
			break label;
			console.log('removed');
		case 2:
			break;
			console.log('removed');
		default:
			break label;
			console.log('removed');
	}
	console.log('retained');
}

allBreak();

function returnBreakDifferentLabels() {
	outer: {
		inner: {
			switch (globalThis.unknown) {
				case 1:
					break outer;
					console.log('removed');
				case 2:
					break inner;
					console.log('removed');
				default:
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
	switch (globalThis.unknown) {
	}
	console.log('retained');
}

empty();
