import { ObjectPath } from '../values';
import * as NodeType from './NodeType';
import { ExpressionNode, NodeBase } from './shared/Node';
import { PatternNode } from './shared/Pattern';

export default class VariableDeclarator extends NodeBase {
	type: NodeType.tVariableDeclarator;
	id: PatternNode;
	init: ExpressionNode | null;

	declareDeclarator(kind: string) {
		this.id.declare(kind, this.init);
	}

	reassignPath(path: ObjectPath) {
		this.id.reassignPath(path);
	}
}
