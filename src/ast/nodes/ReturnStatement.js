import Statement from './shared/Statement.js';
import {UNKNOWN_ASSIGNMENT} from '../values';

export default class ReturnStatement extends Statement {
	hasEffects ( options ) {
		return super.hasEffects( options )
			|| !options.ignoreReturnAwaitYield();
	}

	initialiseNode () {
		this.scope.addReturnExpression( this.argument || UNKNOWN_ASSIGNMENT );
	}
}
