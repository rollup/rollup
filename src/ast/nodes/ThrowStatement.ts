import ExecutionPathOptions from '../ExecutionPathOptions';
import { ExpressionNode } from './shared/Expression';
import { GenericStatementNode } from './shared/Statement';

export default class ThrowStatement extends GenericStatementNode {
	type: 'ThrowStatement';
	argument: ExpressionNode;

	hasEffects (_options: ExecutionPathOptions) {
		return true;
	}
}
