import { ObjectPath } from '../utils/PathTracker';
import { UNDEFINED_EXPRESSION } from '../values';
import * as NodeType from './NodeType';
import { ExpressionNode, NodeBase } from './shared/Node';
import { PatternNode } from './shared/Pattern';

export default class VariableDeclarator extends NodeBase {
	id!: PatternNode;
	init!: ExpressionNode | null;
	type!: NodeType.tVariableDeclarator;

	declareDeclarator(kind: string) {
		this.id.declare(kind, this.init || UNDEFINED_EXPRESSION);
	}

	deoptimizePath(path: ObjectPath) {
		this.id.deoptimizePath(path);
	}
}
