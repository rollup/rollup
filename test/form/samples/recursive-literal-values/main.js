function foo() {
	return foo()
}

if (foo()) {
	console.log('A')
} else {
	console.log('B')
}
