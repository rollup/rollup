import ExecutionPathOptions from '../ExecutionPathOptions';
import { ExpressionNode } from './shared/Expression';
import { BasicStatementNode } from './shared/Statement';

export default class ThrowStatement extends BasicStatementNode {
	type: 'ThrowStatement';
	argument: ExpressionNode;

	hasEffects (_options: ExecutionPathOptions) {
		return true;
	}
}
