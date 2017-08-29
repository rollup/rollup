import Statement from './shared/Statement.js';

export default class ExpressionStatement extends Statement {
	hasEffects ( options ) {
		return super.hasEffects( options ) || this.expression.hasEffectsAsExpressionStatement(options);
	}

	render ( code, es ) {
		super.render( code, es );
		if ( this.included ) this.insertSemicolon( code );
	}
}
