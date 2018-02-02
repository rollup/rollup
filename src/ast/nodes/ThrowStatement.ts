import ExecutionPathOptions from '../ExecutionPathOptions';
import { NodeType } from './NodeType';
import { ExpressionNode, NodeBase } from './shared/Node';

export default class ThrowStatement extends NodeBase {
	type: NodeType.ThrowStatement;
	argument: ExpressionNode;

	hasEffects (_options: ExecutionPathOptions) {
		return true;
	}
}
