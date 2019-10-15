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
	inner: {
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
		else break outer;
	}
	console.log('retained');
}

function withConsequentReturn() {
	outer: {
		inner: {
			if (globalThis.unknown) return;
			else break inner;
		}
		console.log('retained');
	}
	outer: {
		inner: {
			return;
		}
	}
}

withConsequentReturn();

function withAlternateReturn() {
	outer: {
		inner: {
			if (globalThis.unknown) break inner;
			else return;
		}
		console.log('retained');
	}
}

withAlternateReturn();
