import { ObjectPath, UNDEFINED_EXPRESSION } from '../values';
import * as NodeType from './NodeType';
import { ExpressionNode, NodeBase } from './shared/Node';
import { PatternNode } from './shared/Pattern';

export default class VariableDeclarator extends NodeBase {
	type: NodeType.tVariableDeclarator;
	id: PatternNode;
	init: ExpressionNode | null;

	declareDeclarator(kind: string) {
		this.id.declare(kind, this.init || UNDEFINED_EXPRESSION);
	}

	reassignPath(path: ObjectPath) {
		this.id.reassignPath(path);
	}
}
