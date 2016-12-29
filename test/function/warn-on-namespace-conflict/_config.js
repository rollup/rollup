module.exports = {
	description: 'warns on duplicate export * from',
	warnings: [
		{
			code: 'NAMESPACE_CONFLICT',
			message: `Conflicting namespaces: main.js re-exports 'foo' from both foo.js (will be ignored) and deep.js`
		}
	]
};
