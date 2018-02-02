import ExecutionPathOptions from '../ExecutionPathOptions';
import { ExpressionNode, NodeBase, Node } from './shared/Node';
import { NodeType } from './NodeType';

export default class DoWhileStatement extends NodeBase {
	type: NodeType.DoWhileStatement;
	body: Node;
	test: ExpressionNode;

	hasEffects (options: ExecutionPathOptions): boolean {
		return (
			this.test.hasEffects(options) ||
			this.body.hasEffects(options.setIgnoreBreakStatements())
		);
	}
}
