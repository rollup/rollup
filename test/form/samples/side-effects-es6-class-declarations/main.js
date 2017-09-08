class Empty {}
const empty = new Empty();

class NoSideEffects {
	constructor ( foo = 1 ) {
		this.x = 1;
		const mutateThis = () => this.y = 1;
		mutateThis();
	}

	method1 () {
		this.method2();
	}

	[(() => 'method2')()] () {
		console.log( 'not called' );
	}
}
const noSideEffects = new NoSideEffects();

class KeySideEffect {
	[console.log( 'effect' )] () {}
}

class ConstructorSideEffect {
	constructor () {
		console.log( 'effect' );
	}
}
const constructorSideEffect = new ConstructorSideEffect();

class ConstructorParamSideEffect {
	constructor ( foo = console.log( 'effect' ) ) {}
}
const constructorParamSideEffect = new ConstructorParamSideEffect();

class ConstructorParamCallSideEffect {
	constructor ( foo = () => console.log( 'effect' ) ) {
		foo();
	}
}
const constructorParamCallSideEffect = new ConstructorParamCallSideEffect();

class MethodCallSideEffect {
	constructor () {
		this.effect();
	}

	effect () {
		console.log( 'effect' );
	}
}
const methodCallSideEffect = new MethodCallSideEffect();
