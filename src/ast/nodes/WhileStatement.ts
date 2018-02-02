import ExecutionPathOptions from '../ExecutionPathOptions';
import { NodeType } from './NodeType';
import { ExpressionNode, NodeBase, Node } from './shared/Node';

export default class WhileStatement extends NodeBase {
	type: NodeType.WhileStatement;
	test: ExpressionNode;
	body: Node;

	hasEffects (options: ExecutionPathOptions): boolean {
		return (
			this.test.hasEffects(options) ||
			this.body.hasEffects(options.setIgnoreBreakStatements())
		);
	}
}
