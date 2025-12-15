let triggered = false;

function process() {
	using _ = {
		[Symbol.dispose]: () => {
			triggered = true;
		}
	};
}

process();

assert.ok(triggered);

