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

function issue(obj) {
	switch (obj.field1) {
		case 'baz':
			switch (obj.field2) {
				case 'value': {
					if (obj.field3) {
						if (obj.field4) {
							break;
						}
					}
					throw new Error(`error 1`);
				}
				default:
					throw new Error(`error 2`);
			}
			break;
		default:
			throw new Error('error 3');
	}
}

issue({ field1: 'baz', field2: 'value' });
