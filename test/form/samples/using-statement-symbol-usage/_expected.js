function process() {
	using _ = {
		[Symbol.dispose]: () => console.log('dispose')};
}

process();

async function processAsync() {
    await using _ = {
      [Symbol.asyncDispose]: () => console.log('asyncDispose')};
}

processAsync();
