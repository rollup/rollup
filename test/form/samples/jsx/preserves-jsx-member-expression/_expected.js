const obj = {
	Foo: () => {},
	bar: { Baz: () => {} }
};

const result1 = <obj.Foo></obj.Foo>;
const result2 = <obj.bar.Baz></obj.bar.Baz>;

export { result1, result2 };
