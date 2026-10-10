await using resource = {
	async [Symbol.asyncDispose]() {
		track('module');
	}
};

{
	await using resource = {
		async [Symbol.asyncDispose]() {
			track('block');
		}
	};
}
track('body');
