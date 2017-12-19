import Statement from './shared/Statement';

export default class DoWhileStatement extends Statement {
	hasEffects ( options ) {
		return (
			this.test.hasEffects( options )
			|| this.body.hasEffects( options.setIgnoreBreakStatements() )
		);
	}
}
