export class MyClass {
	constructor() { }
}
assert.equal(MyClass.name, "MyClass") // oops
export { MyClass as MyClass2 } from "./MyClass"