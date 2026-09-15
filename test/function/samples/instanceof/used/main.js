class Foo {}
function Bar() {}

if (!(new Foo() instanceof Foo)) {
	assert.fail('instanceof not resolved correctly');
}

if (!(new Bar() instanceof Bar)) {
	assert.fail('instanceof not resolved correctly');
}
