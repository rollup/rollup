class Foo {
	static staticProp;
	prop;
}

export const callStaticProp = () => Foo.staticProp() || false;

export const callProp = () => {
	const foo = new Foo();
	return foo.prop() || false;
};
