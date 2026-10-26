export async function run() {
	const resource = {
		closed: false,
		get [Symbol.dispose]() {
			this.closed = true;
			return () => {};
		}
	};
	{
		using wrapped = resource;
	}
	if (!resource.closed) assert.fail('disposal did not close resource');

	const asyncResource = {
		closed: false,
		get [Symbol.asyncDispose]() {
			this.closed = true;
			return async () => {};
		}
	};
	{
		await using wrapped = asyncResource;
	}
	if (!asyncResource.closed) assert.fail('disposal did not close asyncResource');

	const fallbackResource = {
		closed: false,
		[Symbol.asyncDispose]: null,
		get [Symbol.dispose]() {
			this.closed = true;
			return () => {};
		}
	};
	{
		await using wrapped = fallbackResource;
	}
	if (!fallbackResource.closed) assert.fail('disposal did not close fallbackResource');
}
