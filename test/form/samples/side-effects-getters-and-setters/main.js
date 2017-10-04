const retained1a = {
	get effect () {
		console.log( 'effect' );
	},
	get noEffect () {
		const x = 1;
	}
};

const removed1 = retained1a.noEffect;
const retained1b = retained1a.effect;
const retained1c = retained1a[ 'eff' + 'ect' ];

const removed2a = {
	get shadowedEffect () {
		console.log( 'effect' );
	},
	shadowedEffect: true,
	set shadowedEffect ( value ) {
		console.log( 'effect' );
	}
};

const removed2b = removed2a.shadowedEffect;
const removed2c = removed2a.missingProp;

const retained3 = {
	set effect ( value ) {
		console.log( value );
	}
};

retained3.effect = 'retained';

const retained4 = {
	set effect ( value ) {
		console.log( value );
	}
};

retained4[ 'eff' + 'ect' ] = 'retained';

const removed5 = {
	set noEffect ( value ) {
		const x = value;
	}
};

removed5.noEffect = 'removed';

const removed6 = {
	set shadowedEffect ( value ) {
		console.log( 'effect' );
	},
	shadowedEffect: true
};

removed6.shadowedEffect = true;
removed6.missingProp = true;

const retained7 = {
	foo: () => {},
	get foo () {}
};

retained7.foo();
