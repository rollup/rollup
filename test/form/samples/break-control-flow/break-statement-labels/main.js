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
		console.log('retained');
		break outer;
		console.log('removed');
	}
	console.log('removed');
}

outer: {
	inner: {
		if (globalThis.unknown) break inner;
		else break outer;
		console.log('removed');
	}
	console.log('retained');
}

function withReturn() {
	outer: {
		inner: {
			if (globalThis.unknown) break inner;
			else return;
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

withReturn();
