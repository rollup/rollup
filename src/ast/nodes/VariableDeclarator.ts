import { ExpressionNode, NodeBase } from './shared/Node';
import ExecutionPathOptions from '../ExecutionPathOptions';
import { PatternNode } from './shared/Pattern';
import { NodeType } from './NodeType';
import { ObjectPath } from '../values';

export default class VariableDeclarator extends NodeBase {
	type: NodeType.VariableDeclarator;
	id: PatternNode;
	init: ExpressionNode | null;

	declareDeclarator(kind: string) {
		this.id.declare(kind, this.init);
	}

	reassignPath(path: ObjectPath, options: ExecutionPathOptions) {
		this.id.reassignPath(path, options);
	}
}
