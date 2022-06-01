export class Bar {
	constructor(value) {
		this.x = value;
	}
	value() {
		return this.x;
	}
}
var bar = new Bar(123);
console.log(bar.value());
