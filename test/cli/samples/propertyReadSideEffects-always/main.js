class C {
	get x() {
		console.log(`side effect ${++count}`)
		return 42
	}
}
let count = 0
const obj = new C
console.log(obj.x)

// these statements should be retained
if (obj.x) {
	obj["x"]
	const {x} = obj
}
let x
({x} = obj)

// demonstrate that tree shaking still works
const unused = x => x
unused(123)
