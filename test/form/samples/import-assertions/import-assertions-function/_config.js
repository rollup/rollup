module.exports = {
	description: 'adds import assertions for external JSON files',
	options: {
		external: true,
		output: {
			name: 'bundle',
			externalImportAssertions({ id, ...other }) {
				const [, assertions] = id.split('?');
				if (assertions) {
					return Object.fromEntries(assertions.split('&').map(assertion => assertion.split('=')));
				}
			}
		}
	}
};
