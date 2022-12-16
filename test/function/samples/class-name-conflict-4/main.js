import Bar from './reexport';

const wrapper = () => {
	class Foo extends Bar {
		static assertName() {
			assert.strictEqual(this.name, 'Foo');
			assert.strictEqual(super.name, 'Foo');
		}
	}

	return Foo;
};

wrapper().assertName();
