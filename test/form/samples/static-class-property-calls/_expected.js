class Foo {
	static isTrue = () => true;
	static noEffect = () => {};
	static effect = () => console.log('effect');
	static missing;
}

console.log('retained');
Foo.effect();
Foo.missing();

class Bar {
	static flag = false
	static mutate = function() {
		this.flag = true;
	}
}

Bar.mutate();
if (Bar.flag) console.log('retained');
else console.log('unimportant');
