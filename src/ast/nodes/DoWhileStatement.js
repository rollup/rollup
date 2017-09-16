import Statement from './shared/Statement.js';

export default class DoWhileStatement extends Statement {
	hasEffects ( options ) {
		return (
			this.included
			|| this.test.hasEffects( options )
			|| this.body.hasEffects( options.setIgnoreBreakStatements() )
		);
	}
}
