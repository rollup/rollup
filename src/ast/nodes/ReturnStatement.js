import Statement from './shared/Statement.js';

export default class ReturnStatement extends Statement {
	bind () {
		this.findParent( /Function/ ).returnStatements.push( this );
	}

	initialise ( scope ) {
		super.initialise( scope );
	}
}
