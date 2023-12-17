outer: {
	inner: {
		console.log('retained');
		break inner;
		console.log('removed');
	}
	console.log('retained');
	break outer;
	console.log('removed');
}

outer: {
	inner: {
		break inner;
		console.log('removed');
	}
	console.log('retained');
	break outer;
	console.log('removed');
}

outer: {
	inner: /* retained comment */ {
		console.log('retained');
		break outer;
		console.log('removed');
	}
	console.log('removed');
}

{
	outer: {
		inner: {
			break outer;
			console.log('removed');
		}
		console.log('removed');
	}
	console.log('retained');
}

outer: {
	inner: {
		if (globalThis.unknown) break inner;
		break outer;
		console.log('removed');
	}
	console.log('retained');
}

outer: {
	switch (globalThis.unknown) {
		case 1:
			(() => {
				outer: console.log('retained');
			})();
		case 2:
			break outer;
	}
}

// removed
outer: {
	if (globalThis.unknown) {
		break outer;
	} else {
		(() => {
			inner: {
				outer: {
					break inner;
				}
				console.log('removed');
			}
		})();
	}
}

function withConsequentReturn() {
	outer: {
		inner: {
			if (globalThis.unknown) return;
			else break inner;
			console.log('removed');
		}
		console.log('retained');
	}
	outer: {
		inner: {
			return;
			break inner;
			console.log('removed');
		}
		console.log('removed');
	}
}

withConsequentReturn();

function withAlternateReturn() {
	outer: {
		inner: {
			if (globalThis.unknown) break inner;
			else return;
			console.log('removed');
		}
		console.log('retained');
	}
}

withAlternateReturn();
