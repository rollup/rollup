outer: {
	inner: {
		console.log('retained');
		break inner;
	}
	console.log('retained');
	break outer;
}

outer: {
	inner: {
		console.log('retained');
		break outer;
	}
}

outer: {
	inner: {
		if (globalThis.unknown) break inner;
		else break outer;
	}
	console.log('retained');
}

function withReturn() {
	outer: {
		inner: {
			if (globalThis.unknown) break inner;
			else return;
		}
		console.log('retained');
	}
	outer: {
		inner: {
			return;
		}
	}
}

withReturn();

// TODO Lukas do-while-loop support
// TODO Lukas switch statements
