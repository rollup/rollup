define(function () { 'use strict';

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

});
