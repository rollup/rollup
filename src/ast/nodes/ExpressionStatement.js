import Statement from './shared/Statement.js';

export default class ExpressionStatement extends Statement {
	render ( code, es ) {
		super.render( code, es );
		if ( this.included ) this.insertSemicolon( code );
	}
}
