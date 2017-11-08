false || {};
true && {};
true || console.log( 'effect' );
false && console.log( 'effect' );

// effect
false || console.log( 'effect' );
true && console.log( 'effect' );
console.log( 'effect' ) || {};
console.log( 'effect' ) && {};

const foo = {
	get effect () {
		console.log( 'effect' );
	},
	get noEffect () {}
};

// accessed - no effect
(false || foo).noEffect;
(true && foo).noEffect;
(true || foo).effect;
(false && foo).effect;

// effect
(false || foo).effect;
(true && foo).effect;

// assigned - no effect
(false || {}).foo = 1;
(true && {}).foo = 1;
(true || null).foo = 1;
(false && null).foo = 1;

// effect
(false || null).foo = 1;
(true && null).foo = 1;

// called - no effect
(false || (() => {}))();
(true && (() => {}))();

// effect
(true || (() => {}))();
(false && (() => {}))();
(false || (() => console.log( 'effect' )))();
(true && (() => console.log( 'effect' )))();

// call return value - no effect
(false || (() => () => {}))()();
(true && (() => () => {}))()();

// effect
(true || (() => () => {}))()();
(false && (() => () => {}))()();
(false || (() => () => console.log( 'effect' )))()();
(true && (() => () => console.log( 'effect' )))()();
