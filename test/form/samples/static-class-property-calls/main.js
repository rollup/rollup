class Foo {
	static isTrue = () => true;
	static noEffect = () => {};
	static effect = () => console.log('effect');
	static missing;
}

if (Foo.isTrue()) console.log('retained');
else console.log('removed');
Foo.noEffect();
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
