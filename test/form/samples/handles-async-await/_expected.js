async function callback() {
	const response = await Promise.resolve(43);
	return response - 1;
}

export { callback };
