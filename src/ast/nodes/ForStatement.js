import Statement from './shared/Statement.js';

export default class ForStatement extends Statement {
	bind () {
		const scope = this.body.scope;

		this.init.bind( scope );
		this.test.bind( scope );
		this.update.bind( scope );
		this.body.bind( scope );
	}

	hasEffects () {
		return super.hasEffects( this.body.scope );
	}

	initialise ( scope ) {
		this.body.createScope( scope );
		scope = this.body.scope;

		// can't use super, because we need to control the order
		this.init.initialise( scope );
		this.test.initialise( scope );
		this.update.initialise( scope );
		this.body.initialise( scope );
	}

	run ( scope ) {
		super.run( scope );
	}
}
