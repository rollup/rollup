import { UNKNOWN_EXPRESSION } from '../values';
import ExecutionPathOptions from '../ExecutionPathOptions';
import { StatementBase } from './shared/Statement';
import { NodeType } from './index';
import { ExpressionNode } from './shared/Node';

export default class ReturnStatement extends StatementBase {
	type: NodeType.ReturnStatement;
	argument: ExpressionNode | null;

	hasEffects (options: ExecutionPathOptions) {
		return super.hasEffects(options) || !options.ignoreReturnAwaitYield();
	}

	initialiseNode () {
		this.scope.addReturnExpression(this.argument || UNKNOWN_EXPRESSION);
	}
}
