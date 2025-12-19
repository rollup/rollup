let triggered = false;

async function process() {
	await using _ = {
		[Symbol.asyncDispose]: () => {
			triggered = true;
		}
	};
}

export const run = () => process().then(() => assert.ok(triggered));
