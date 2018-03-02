class MyClass {
	constructor() { }
}

let MyClass$1 = class MyClass {
	constructor() { }
}
assert.equal(MyClass$1.name, "MyClass"); // oops

export { MyClass$1 as MyClass, MyClass as MyClass2 };
