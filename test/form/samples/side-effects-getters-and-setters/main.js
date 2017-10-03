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
