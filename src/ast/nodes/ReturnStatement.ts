import Statement from './shared/Statement';
import { UNKNOWN_ASSIGNMENT } from '../values';
import ExecutionPathOptions from '../ExecutionPathOptions';
import Expression from './Expression';

export default class ReturnStatement extends Statement {
	type: 'ReturnStatement';
	argument: Expression | null;

	hasEffects (options: ExecutionPathOptions) {
		return super.hasEffects(options) || !options.ignoreReturnAwaitYield();
	}

	initialiseNode () {
		this.scope.addReturnExpression(this.argument || UNKNOWN_ASSIGNMENT);
	}
}
