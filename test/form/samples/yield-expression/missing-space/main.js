function* test() {
	yield!1||null;
}

for (const x of test()) {
	console.log(x);
}
