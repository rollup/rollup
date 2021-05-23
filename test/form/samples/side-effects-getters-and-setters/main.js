const retained1 = {
	get effect() {
		console.log('effect');
	},
	get noEffect() {
		const x = 1;
		return x;
	}
};

// removed
retained1.noEffect;

//retained
retained1.effect;
retained1['eff' + 'ect'];

const removed2 = {
	get shadowedEffect() {
		console.log('effect');
		return 1;
	},
	shadowedEffect: true,
	set shadowedEffect(value) {
		console.log(value);
	}
};

removed2.shadowedEffect;

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

const removed5 = {
	set noEffect(value) {
		const x = value;
	}
};

removed5.noEffect = 'removed';

const retained7 = {
	foo: () => {},
	get foo() {
		return 1;
	}
};

retained7.foo();
