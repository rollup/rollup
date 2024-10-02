const obj = {
	Foo: () => {},
	bar: { Baz: () => {} }
};

export const result1 = <obj.Foo></obj.Foo>;
export const result2 = <obj.bar.Baz></obj.bar.Baz>;
