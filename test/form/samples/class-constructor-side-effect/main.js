class Effect {
	constructor () {
		console.log( 'Foo' );
	}
}

new Effect();

class NoEffect {
	constructor () {
	}
}

new NoEffect();

class Empty {}

new Empty.doesNotExist();
