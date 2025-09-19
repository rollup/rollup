function useState() {
	return ['foo', 'bar', 'qux'];
}

const [foo$1] = useState();
assert.ok(foo$1);

const [foo, , qux] = useState();
assert.ok(foo);
assert.ok(qux);
