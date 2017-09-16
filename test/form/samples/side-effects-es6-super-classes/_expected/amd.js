define(function () { 'use strict';

	class GlobalSuper extends GlobalClass {}
	const globalSuper = new GlobalSuper();

	class SideEffectSuper extends (() => {
		console.log( 'effect' );
		return class {};
	})() {
	}

	class SuperConstructorEffect {
		constructor () {
			console.log( 'effect' );
		}
	}
	class SideEffectsSuperConstructor1 extends SuperConstructorEffect {}
	const sideEffectsSuperConstructor1 = new SideEffectsSuperConstructor1();

	class SideEffectsSuperConstructor2 extends SuperConstructorEffect {
		constructor () {
			super();
		}
	}
	const sideEffectsSuperConstructor2 = new SideEffectsSuperConstructor2();

	class SuperMethodEffect {
		effect () {
			console.log( 'effect' );
		}
	}
	class SideEffectsSuperMethod extends SuperMethodEffect {
		constructor () {
			super();
			super.effect();
		}
	}
	const sideEffectsSuperMethod = new SideEffectsSuperMethod();

});
