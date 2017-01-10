import Statement from './shared/Statement.js';

export default class ReturnStatement extends Statement {
	initialise ( scope ) {
		this.findParent( /Function/ ).returnStatements.push( this );
		super.initialise( scope );
	}
}
