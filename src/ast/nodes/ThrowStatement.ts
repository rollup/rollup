import ExecutionPathOptions from '../ExecutionPathOptions';
import { StatementBase } from './shared/Statement';
import { NodeType } from './index';
import { ExpressionNode } from './shared/Node';

export default class ThrowStatement extends StatementBase {
	type: NodeType.ThrowStatement;
	argument: ExpressionNode;

	hasEffects (_options: ExecutionPathOptions) {
		return true;
	}
}
