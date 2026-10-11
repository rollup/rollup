export async function run() {
	const base = {
		[Symbol.dispose]() {
			this.closed = true;
		}
	};
	const resource = { ...base, closed: false };
	{
		using wrapped = resource;
	}
	if (!resource.closed) assert.fail('disposal did not close resource');

	const asyncBase = {
		async [Symbol.asyncDispose]() {
			this.closed = true;
		}
	};
	const asyncResource = { ...asyncBase, closed: false };
	{
		await using wrapped = asyncResource;
	}
	if (!asyncResource.closed) assert.fail('disposal did not close asyncResource');
}
