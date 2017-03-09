module.exports = {
	description: 'warns on duplicate export * from',
	warnings: [
		{
			code: 'NAMESPACE_CONFLICT',
			message: `Conflicting namespaces: main.js re-exports 'foo' from both foo.js and deep.js (will be ignored)`
		}
	]
};
