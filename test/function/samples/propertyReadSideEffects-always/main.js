let effects = 0
var obj = {}
Object.defineProperty(obj, 'x', {
	get() {
		++effects
	}
})
let value
({x: value} = obj)
obj.x
obj["x"]
const {x} = obj

assert.strictEqual(effects, 4)
