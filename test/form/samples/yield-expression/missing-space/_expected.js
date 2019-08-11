function* test() {
	yield null;
}

for (const x of test()) {
	console.log(x);
}
