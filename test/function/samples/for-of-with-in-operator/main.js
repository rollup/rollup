for (const foo of [{}]) {
	if ('x' in foo) {
		throw new Error('There should be no x');
	}
}
