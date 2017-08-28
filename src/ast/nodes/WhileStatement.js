import Statement from './shared/Statement.js';

export default class WhileStatement extends Statement {
	hasEffects ( options ) {
		return (
			this.included
			|| this.test.hasEffects( options )
			|| this.body.hasEffects( Object.assign( {}, options, { inNestedBreakableStatement: true } ) )
		);
	}
}
