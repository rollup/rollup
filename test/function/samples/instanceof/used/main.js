class Foo {}

if (!(new Foo() instanceof Foo)) {
	assert.fail('instanceof not resolved correctly');
}
