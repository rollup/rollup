import ExecutionPathOptions from '../ExecutionPathOptions';
import { ExpressionNode } from './shared/Expression';
import { StatementBase } from './shared/Statement';

export default class ThrowStatement extends StatementBase {
	type: 'ThrowStatement';
	argument: ExpressionNode;

	hasEffects (_options: ExecutionPathOptions) {
		return true;
	}
}
