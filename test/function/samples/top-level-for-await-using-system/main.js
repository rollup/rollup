for (await using resource of [
	{
		async [Symbol.asyncDispose]() {
			track('disposed');
		}
	}
]) {
	track('body');
}
for await (using resource of [
	{
		[Symbol.dispose]() {
			track('sync disposed');
		}
	}
]) {
	track('sync body');
}
for await (await using resource of [
	{
		async [Symbol.asyncDispose]() {
			track('async disposed');
		}
	}
]) {
	track('async body');
}
track('after');
