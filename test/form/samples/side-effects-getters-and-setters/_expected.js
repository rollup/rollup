const retained1 = {
	get effect() {
		console.log('effect');
	}};

//retained
retained1.effect;
retained1['eff' + 'ect'];

const retained3 = {
	set effect(value) {
		console.log(value);
	}
};

retained3.effect = 'retained';

const retained4 = {
	set effect(value) {
		console.log(value);
	}
};

retained4['eff' + 'ect'] = 'retained';

const retained7 = {
	foo: () => {},
	get foo() {
		return 1;
	}
};

retained7.foo();
