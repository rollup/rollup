import Statement from './shared/Statement.js';

export default class ForStatement extends Statement {
	hasEffects () {
		return super.hasEffects( this.body.scope );
	}

	initialise ( scope ) {
		this.body.createScope( scope );
		scope = this.body.scope;

		// can't use super, because we need to control the order
		if ( this.init ) this.init.initialise( scope );
		if ( this.test ) this.test.initialise( scope );
		if ( this.update ) this.update.initialise( scope );
		this.body.initialise( scope );
	}

	run ( scope ) {
		super.run( scope );
	}
}
