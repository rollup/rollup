import Statement from './shared/Statement.js';

export default class ReturnStatement extends Statement {
	hasEffects ( options ) {
		return super.hasEffects( options )
			|| !options.inNestedFunctionCall;
	}
}
