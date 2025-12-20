function process() {
	using _ = {
		[Symbol.dispose]: () => console.log('dispose'),
    [Symbol.asyncDispose]: () => console.log('asyncDispose'),
    [Symbol.hasInstance]: () => console.log('hasInstance')
  };
}

process();

async function processAsync() {
    await using _ = {
      [Symbol.dispose]: () => console.log('dispose'),
      [Symbol.asyncDispose]: () => console.log('asyncDispose'),
      [Symbol.hasInstance]: () => console.log('hasInstance')
    };
}

processAsync();
