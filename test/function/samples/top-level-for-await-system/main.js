for await (const value of [Promise.resolve(1)]) {
	track(value);
}

{
	for await (const value of [Promise.resolve(2)]) {
		track(value);
	}
}
