outer: {
	inner: {
		console.log('retained');
		break inner;
	}
	console.log('retained');
	break outer;
}

outer: {
	console.log('retained');
	break outer;
}

outer: {
	/* retained comment */ {
		console.log('retained');
		break outer;
	}
}

{
	console.log('retained');
}

outer: {
	inner: {
		if (globalThis.unknown) break inner;
		break outer;
	}
	console.log('retained');
}

outer: {
	switch (globalThis.unknown) {
		case 1:
			(() => {
				console.log('retained');
			})();
		case 2:
			break outer;
	}
}

function withConsequentReturn() {
	{
		inner: {
			if (globalThis.unknown) return;
			else break inner;
		}
		console.log('retained');
	}
	{
		{
			return;
		}
	}
}

withConsequentReturn();

function withAlternateReturn() {
	{
		inner: {
			if (globalThis.unknown) break inner;
			else return;
		}
		console.log('retained');
	}
}

withAlternateReturn();
