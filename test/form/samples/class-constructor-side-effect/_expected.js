class Effect {
	constructor () {
		console.log( 'Foo' );
	}
}

new Effect();

class Empty {}

new Empty.doesNotExist();
